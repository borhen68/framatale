import { Model } from 'mongoose';
import { PricingRuleDocument } from './schemas/pricing-rule.schema';
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
export declare class PricingEngineService {
    private pricingRuleModel;
    private configService;
    private analyticsService;
    private costPlusPricingService;
    private readonly logger;
    private priceCache;
    constructor(pricingRuleModel: Model<PricingRuleDocument>, configService: ConfigurationService, analyticsService: AnalyticsService, costPlusPricingService: CostPlusPricingService);
    calculatePrice(request: PricingRequest): Promise<PricingResult>;
    private getApplicableRules;
    private calculateBasePrice;
    private applyDiscounts;
    private applyTaxes;
    private applyShipping;
    private applyDynamicPricing;
    private finalizeCalculation;
    private calculateVolumeDiscount;
    private getDemandLevel;
    private getSeasonalMultiplier;
    private getInventoryMultiplier;
    private generateCacheKey;
    private cachePrice;
    private trackPricingEvent;
}
