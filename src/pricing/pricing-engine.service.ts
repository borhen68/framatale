import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingRule, PricingRuleDocument, PricingType, PricingScope } from './schemas/pricing-rule.schema';
import { ConfigurationService } from '../configuration/configuration.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CostPlusPricingService } from './cost-plus-pricing.service';

export interface PricingRequest {
  productType: string;
  quantity: number;
  userId?: string;
  userSegment?: string;
  region?: string;
  channel?: string;
  customerTier?: string;
  orderValue?: number;
  timestamp?: Date;
  abTestVariant?: string;
}

export interface PricingResult {
  basePrice: number;
  finalPrice: number;
  discounts: Array<{
    type: string;
    amount: number;
    percentage?: number;
    reason: string;
  }>;
  taxes: Array<{
    type: string;
    amount: number;
    rate: number;
  }>;
  shipping?: {
    cost: number;
    method: string;
  };
  currency: string;
  breakdown: {
    subtotal: number;
    totalDiscounts: number;
    totalTaxes: number;
    totalShipping: number;
    grandTotal: number;
  };
  appliedRules: string[];
  metadata: {
    calculatedAt: Date;
    version: string;
    confidence: number;
  };
}

@Injectable()
export class PricingEngineService {
  private readonly logger = new Logger(PricingEngineService.name);
  private priceCache = new Map<string, { price: PricingResult; expiry: number }>();

  constructor(
    @InjectModel(PricingRule.name) private pricingRuleModel: Model<PricingRuleDocument>,
    private configService: ConfigurationService,
    private analyticsService: AnalyticsService,
    private costPlusPricingService: CostPlusPricingService,
  ) {}

  async calculatePrice(request: PricingRequest): Promise<PricingResult> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = this.priceCache.get(cacheKey);

      if (cached && cached.expiry > Date.now()) {
        this.logger.debug(`Price cache hit for ${cacheKey}`);
        return cached.price;
      }

      // Get applicable pricing rules
      const rules = await this.getApplicableRules(request);

      // Calculate base price
      let result = await this.calculateBasePrice(request, rules);

      // Apply discounts
      result = await this.applyDiscounts(result, request, rules);

      // Apply taxes
      result = await this.applyTaxes(result, request);

      // Apply shipping costs
      result = await this.applyShipping(result, request);

      // Apply dynamic pricing adjustments
      result = await this.applyDynamicPricing(result, request, rules);

      // Finalize calculation
      result = this.finalizeCalculation(result, rules);

      // Cache the result
      this.cachePrice(cacheKey, result);

      // Track pricing analytics
      await this.trackPricingEvent(request, result, Date.now() - startTime);

      return result;

    } catch (error) {
      this.logger.error('Pricing calculation failed', { error, request });
      throw error;
    }
  }

  private async getApplicableRules(request: PricingRequest): Promise<PricingRuleDocument[]> {
    const now = request.timestamp || new Date();

    const query: any = {
      isActive: true,
      $or: [
        { validFrom: { $exists: false } },
        { validFrom: { $lte: now } },
      ],
      $and: [
        {
          $or: [
            { validUntil: { $exists: false } },
            { validUntil: { $gte: now } },
          ],
        },
      ],
    };

    // Add condition filters
    if (request.productType) {
      query['$and'].push({
        $or: [
          { 'conditions.productTypes': { $exists: false } },
          { 'conditions.productTypes': request.productType },
        ],
      });
    }

    if (request.userSegment) {
      query['$and'].push({
        $or: [
          { 'conditions.userSegments': { $exists: false } },
          { 'conditions.userSegments': request.userSegment },
        ],
      });
    }

    if (request.region) {
      query['$and'].push({
        $or: [
          { 'conditions.regions': { $exists: false } },
          { 'conditions.regions': request.region },
        ],
      });
    }

    if (request.quantity) {
      query['$and'].push({
        $or: [
          { 'conditions.minQuantity': { $exists: false } },
          { 'conditions.minQuantity': { $lte: request.quantity } },
        ],
      });

      query['$and'].push({
        $or: [
          { 'conditions.maxQuantity': { $exists: false } },
          { 'conditions.maxQuantity': { $gte: request.quantity } },
        ],
      });
    }

    return this.pricingRuleModel
      .find(query)
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  private async calculateBasePrice(
    request: PricingRequest,
    rules: PricingRuleDocument[],
  ): Promise<PricingResult> {
    // Find the highest priority base pricing rule
    const basePriceRule = rules.find(rule =>
      rule.type === PricingType.FIXED && rule.pricing.basePrice
    );

    let basePrice = basePriceRule?.pricing.basePrice || 0;

    // Apply tiered pricing if applicable
    const tieredRule = rules.find(rule => rule.type === PricingType.TIERED);
    if (tieredRule && tieredRule.pricing.tiers) {
      const applicableTier = tieredRule.pricing.tiers.find(tier =>
        request.quantity >= tier.minQuantity &&
        (!tier.maxQuantity || request.quantity <= tier.maxQuantity)
      );

      if (applicableTier) {
        basePrice = applicableTier.price;
      }
    }

    // Apply volume pricing
    const volumeRule = rules.find(rule => rule.type === PricingType.VOLUME);
    if (volumeRule && request.quantity > 1) {
      const volumeDiscount = this.calculateVolumeDiscount(request.quantity, volumeRule);
      basePrice = basePrice * (1 - volumeDiscount);
    }

    return {
      basePrice,
      finalPrice: basePrice,
      discounts: [],
      taxes: [],
      currency: 'USD',
      breakdown: {
        subtotal: basePrice,
        totalDiscounts: 0,
        totalTaxes: 0,
        totalShipping: 0,
        grandTotal: basePrice,
      },
      appliedRules: [basePriceRule?.name || 'default'].filter(Boolean),
      metadata: {
        calculatedAt: new Date(),
        version: '1.0',
        confidence: 1.0,
      },
    };
  }

  private async applyDiscounts(
    result: PricingResult,
    request: PricingRequest,
    rules: PricingRuleDocument[],
  ): Promise<PricingResult> {
    const discountRules = rules.filter(rule => rule.discount);

    for (const rule of discountRules) {
      if (!rule.discount) continue;

      let discountAmount = 0;
      let discountPercentage = 0;

      switch (rule.discount.type) {
        case 'FIXED_AMOUNT':
          discountAmount = rule.discount.value;
          break;

        case 'PERCENTAGE':
          discountPercentage = rule.discount.value;
          discountAmount = result.finalPrice * (rule.discount.value / 100);
          break;

        case 'BUY_X_GET_Y':
          if (request.quantity >= (rule.discount.buyQuantity || 0)) {
            const freeItems = Math.floor(request.quantity / (rule.discount.buyQuantity || 1)) * (rule.discount.getQuantity || 0);
            discountAmount = freeItems * (result.basePrice / request.quantity);
          }
          break;

        case 'BULK_DISCOUNT':
          if (request.quantity >= 10) {
            discountPercentage = Math.min(rule.discount.value, rule.discount.maxDiscount || 50);
            discountAmount = result.finalPrice * (discountPercentage / 100);
          }
          break;

        case 'LOYALTY_DISCOUNT':
          if (request.customerTier === 'premium' || request.customerTier === 'vip') {
            const multiplier = rule.discount.loyaltyMultiplier || 1;
            discountPercentage = rule.discount.value * multiplier;
            discountAmount = result.finalPrice * (discountPercentage / 100);
          }
          break;
      }

      if (discountAmount > 0) {
        result.discounts.push({
          type: rule.discount.type,
          amount: discountAmount,
          percentage: discountPercentage,
          reason: rule.name,
        });

        result.finalPrice -= discountAmount;
        result.breakdown.totalDiscounts += discountAmount;
        result.appliedRules.push(rule.name);
      }
    }

    return result;
  }

  private async applyTaxes(result: PricingResult, request: PricingRequest): Promise<PricingResult> {
    // Get tax configuration for region
    const taxConfig = await this.configService.getConfiguration(
      `tax_rates_${request.region}`,
      { environment: 'prod' }
    );

    if (taxConfig) {
      const taxRate = taxConfig.rate || 0;
      const taxAmount = result.finalPrice * (taxRate / 100);

      result.taxes.push({
        type: 'sales_tax',
        amount: taxAmount,
        rate: taxRate,
      });

      result.breakdown.totalTaxes += taxAmount;
    }

    return result;
  }

  private async applyShipping(result: PricingResult, request: PricingRequest): Promise<PricingResult> {
    // Get shipping configuration
    const shippingConfig = await this.configService.getConfiguration(
      `shipping_rates_${request.region}`,
      { environment: 'prod' }
    );

    if (shippingConfig) {
      const shippingCost = shippingConfig.standardRate || 0;

      result.shipping = {
        cost: shippingCost,
        method: 'standard',
      };

      result.breakdown.totalShipping = shippingCost;
    }

    return result;
  }

  private async applyDynamicPricing(
    result: PricingResult,
    request: PricingRequest,
    rules: PricingRuleDocument[],
  ): Promise<PricingResult> {
    const dynamicRule = rules.find(rule => rule.type === PricingType.DYNAMIC);

    if (!dynamicRule?.dynamic) {
      return result;
    }

    let priceMultiplier = 1.0;

    // Apply demand-based pricing
    if (dynamicRule.dynamic.demandMultiplier) {
      const demandLevel = await this.getDemandLevel(request.productType);
      priceMultiplier *= (1 + (demandLevel * dynamicRule.dynamic.demandMultiplier));
    }

    // Apply seasonality factor
    if (dynamicRule.dynamic.seasonalityFactor) {
      const seasonalMultiplier = this.getSeasonalMultiplier(request.timestamp);
      priceMultiplier *= seasonalMultiplier;
    }

    // Apply inventory-based pricing
    if (dynamicRule.dynamic.inventoryLevel) {
      const inventoryMultiplier = await this.getInventoryMultiplier(request.productType);
      priceMultiplier *= inventoryMultiplier;
    }

    if (priceMultiplier !== 1.0) {
      const adjustment = result.finalPrice * (priceMultiplier - 1);
      result.finalPrice += adjustment;

      result.appliedRules.push(`dynamic_pricing_${dynamicRule.name}`);
      result.metadata.confidence *= 0.9; // Reduce confidence for dynamic pricing
    }

    return result;
  }

  private finalizeCalculation(result: PricingResult, rules: PricingRuleDocument[]): PricingResult {
    // Calculate final totals
    result.breakdown.subtotal = result.finalPrice;
    result.breakdown.grandTotal =
      result.finalPrice +
      result.breakdown.totalTaxes +
      result.breakdown.totalShipping;

    // Apply A/B testing price modifications
    const abTestRule = rules.find(rule => rule.abTesting?.isActive);
    if (abTestRule?.abTesting) {
      // This would integrate with your A/B testing system
      // For now, we'll use a simple random assignment
      const variant = abTestRule.abTesting.variants[0];
      if (variant) {
        result.breakdown.grandTotal *= (1 + variant.priceModifier);
        result.appliedRules.push(`ab_test_${variant.name}`);
      }
    }

    return result;
  }

  // Helper methods
  private calculateVolumeDiscount(quantity: number, rule: PricingRuleDocument): number {
    // Simple volume discount calculation
    if (quantity >= 100) return 0.15;
    if (quantity >= 50) return 0.10;
    if (quantity >= 20) return 0.05;
    return 0;
  }

  private async getDemandLevel(productType: string): Promise<number> {
    // This would integrate with your analytics to get real demand data
    // For now, return a mock value
    return Math.random() * 0.2; // 0-20% demand adjustment
  }

  private getSeasonalMultiplier(timestamp?: Date): number {
    const now = timestamp || new Date();
    const month = now.getMonth();

    // Holiday season pricing (November-December)
    if (month >= 10) return 1.1;

    // Summer season (June-August)
    if (month >= 5 && month <= 7) return 1.05;

    return 1.0;
  }

  private async getInventoryMultiplier(productType: string): Promise<number> {
    // This would integrate with your inventory system
    // Low inventory = higher prices, high inventory = lower prices
    return 1.0; // Placeholder
  }

  private generateCacheKey(request: PricingRequest): string {
    return `price_${request.productType}_${request.quantity}_${request.userSegment}_${request.region}`;
  }

  private cachePrice(key: string, result: PricingResult): void {
    const expiry = Date.now() + (5 * 60 * 1000); // 5 minutes cache
    this.priceCache.set(key, { price: result, expiry });
  }

  private async trackPricingEvent(
    request: PricingRequest,
    result: PricingResult,
    calculationTime: number,
  ): Promise<void> {
    // Track pricing analytics
    await this.analyticsService.trackEvent({
      eventType: 'PRICE_CALCULATED' as any,
      userId: request.userId,
      properties: {
        productType: request.productType,
        quantity: request.quantity,
        finalPrice: result.breakdown.grandTotal,
        discountsApplied: result.discounts.length,
        calculationTime,
        appliedRules: result.appliedRules,
      },
    });
  }
}
