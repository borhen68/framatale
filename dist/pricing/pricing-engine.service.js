"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PricingEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingEngineService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const pricing_rule_schema_1 = require("./schemas/pricing-rule.schema");
const configuration_service_1 = require("../configuration/configuration.service");
const analytics_service_1 = require("../analytics/analytics.service");
const cost_plus_pricing_service_1 = require("./cost-plus-pricing.service");
let PricingEngineService = PricingEngineService_1 = class PricingEngineService {
    pricingRuleModel;
    configService;
    analyticsService;
    costPlusPricingService;
    logger = new common_1.Logger(PricingEngineService_1.name);
    priceCache = new Map();
    constructor(pricingRuleModel, configService, analyticsService, costPlusPricingService) {
        this.pricingRuleModel = pricingRuleModel;
        this.configService = configService;
        this.analyticsService = analyticsService;
        this.costPlusPricingService = costPlusPricingService;
    }
    async calculatePrice(request) {
        const startTime = Date.now();
        try {
            const cacheKey = this.generateCacheKey(request);
            const cached = this.priceCache.get(cacheKey);
            if (cached && cached.expiry > Date.now()) {
                this.logger.debug(`Price cache hit for ${cacheKey}`);
                return cached.price;
            }
            const rules = await this.getApplicableRules(request);
            let result = await this.calculateBasePrice(request, rules);
            result = await this.applyDiscounts(result, request, rules);
            result = await this.applyTaxes(result, request);
            result = await this.applyShipping(result, request);
            result = await this.applyDynamicPricing(result, request, rules);
            result = this.finalizeCalculation(result, rules);
            this.cachePrice(cacheKey, result);
            await this.trackPricingEvent(request, result, Date.now() - startTime);
            return result;
        }
        catch (error) {
            this.logger.error('Pricing calculation failed', { error, request });
            throw error;
        }
    }
    async getApplicableRules(request) {
        const now = request.timestamp || new Date();
        const query = {
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
    async calculateBasePrice(request, rules) {
        const basePriceRule = rules.find(rule => rule.type === pricing_rule_schema_1.PricingType.FIXED && rule.pricing.basePrice);
        let basePrice = basePriceRule?.pricing.basePrice || 0;
        const tieredRule = rules.find(rule => rule.type === pricing_rule_schema_1.PricingType.TIERED);
        if (tieredRule && tieredRule.pricing.tiers) {
            const applicableTier = tieredRule.pricing.tiers.find(tier => request.quantity >= tier.minQuantity &&
                (!tier.maxQuantity || request.quantity <= tier.maxQuantity));
            if (applicableTier) {
                basePrice = applicableTier.price;
            }
        }
        const volumeRule = rules.find(rule => rule.type === pricing_rule_schema_1.PricingType.VOLUME);
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
    async applyDiscounts(result, request, rules) {
        const discountRules = rules.filter(rule => rule.discount);
        for (const rule of discountRules) {
            if (!rule.discount)
                continue;
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
    async applyTaxes(result, request) {
        const taxConfig = await this.configService.getConfiguration(`tax_rates_${request.region}`, { environment: 'prod' });
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
    async applyShipping(result, request) {
        const shippingConfig = await this.configService.getConfiguration(`shipping_rates_${request.region}`, { environment: 'prod' });
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
    async applyDynamicPricing(result, request, rules) {
        const dynamicRule = rules.find(rule => rule.type === pricing_rule_schema_1.PricingType.DYNAMIC);
        if (!dynamicRule?.dynamic) {
            return result;
        }
        let priceMultiplier = 1.0;
        if (dynamicRule.dynamic.demandMultiplier) {
            const demandLevel = await this.getDemandLevel(request.productType);
            priceMultiplier *= (1 + (demandLevel * dynamicRule.dynamic.demandMultiplier));
        }
        if (dynamicRule.dynamic.seasonalityFactor) {
            const seasonalMultiplier = this.getSeasonalMultiplier(request.timestamp);
            priceMultiplier *= seasonalMultiplier;
        }
        if (dynamicRule.dynamic.inventoryLevel) {
            const inventoryMultiplier = await this.getInventoryMultiplier(request.productType);
            priceMultiplier *= inventoryMultiplier;
        }
        if (priceMultiplier !== 1.0) {
            const adjustment = result.finalPrice * (priceMultiplier - 1);
            result.finalPrice += adjustment;
            result.appliedRules.push(`dynamic_pricing_${dynamicRule.name}`);
            result.metadata.confidence *= 0.9;
        }
        return result;
    }
    finalizeCalculation(result, rules) {
        result.breakdown.subtotal = result.finalPrice;
        result.breakdown.grandTotal =
            result.finalPrice +
                result.breakdown.totalTaxes +
                result.breakdown.totalShipping;
        const abTestRule = rules.find(rule => rule.abTesting?.isActive);
        if (abTestRule?.abTesting) {
            const variant = abTestRule.abTesting.variants[0];
            if (variant) {
                result.breakdown.grandTotal *= (1 + variant.priceModifier);
                result.appliedRules.push(`ab_test_${variant.name}`);
            }
        }
        return result;
    }
    calculateVolumeDiscount(quantity, rule) {
        if (quantity >= 100)
            return 0.15;
        if (quantity >= 50)
            return 0.10;
        if (quantity >= 20)
            return 0.05;
        return 0;
    }
    async getDemandLevel(productType) {
        return Math.random() * 0.2;
    }
    getSeasonalMultiplier(timestamp) {
        const now = timestamp || new Date();
        const month = now.getMonth();
        if (month >= 10)
            return 1.1;
        if (month >= 5 && month <= 7)
            return 1.05;
        return 1.0;
    }
    async getInventoryMultiplier(productType) {
        return 1.0;
    }
    generateCacheKey(request) {
        return `price_${request.productType}_${request.quantity}_${request.userSegment}_${request.region}`;
    }
    cachePrice(key, result) {
        const expiry = Date.now() + (5 * 60 * 1000);
        this.priceCache.set(key, { price: result, expiry });
    }
    async trackPricingEvent(request, result, calculationTime) {
        await this.analyticsService.trackEvent({
            eventType: 'PRICE_CALCULATED',
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
};
exports.PricingEngineService = PricingEngineService;
exports.PricingEngineService = PricingEngineService = PricingEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(pricing_rule_schema_1.PricingRule.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        configuration_service_1.ConfigurationService,
        analytics_service_1.AnalyticsService,
        cost_plus_pricing_service_1.CostPlusPricingService])
], PricingEngineService);
//# sourceMappingURL=pricing-engine.service.js.map