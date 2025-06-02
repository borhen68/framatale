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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingRuleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const pricing_rule_schema_1 = require("./schemas/pricing-rule.schema");
const pricing_engine_service_1 = require("./pricing-engine.service");
const analytics_service_1 = require("../analytics/analytics.service");
let PricingRuleService = class PricingRuleService {
    pricingRuleModel;
    pricingEngine;
    analyticsService;
    constructor(pricingRuleModel, pricingEngine, analyticsService) {
        this.pricingRuleModel = pricingRuleModel;
        this.pricingEngine = pricingEngine;
        this.analyticsService = analyticsService;
    }
    async createRule(ruleData) {
        const rule = new this.pricingRuleModel({
            ...ruleData,
            validFrom: ruleData.validFrom || new Date(),
        });
        return rule.save();
    }
    async getRules(filters) {
        const query = {};
        if (filters.type)
            query.type = filters.type;
        if (filters.scope)
            query.scope = filters.scope;
        if (filters.isActive !== undefined)
            query.isActive = filters.isActive;
        return this.pricingRuleModel
            .find(query)
            .sort({ priority: -1, createdAt: -1 })
            .exec();
    }
    async updateRule(ruleId, updates) {
        const rule = await this.pricingRuleModel
            .findByIdAndUpdate(ruleId, updates, { new: true })
            .exec();
        if (!rule) {
            throw new common_1.NotFoundException('Pricing rule not found');
        }
        return rule;
    }
    async deleteRule(ruleId) {
        const result = await this.pricingRuleModel.findByIdAndDelete(ruleId).exec();
        if (!result) {
            throw new common_1.NotFoundException('Pricing rule not found');
        }
    }
    async testRule(ruleId, testRequest) {
        const originalPrice = await this.pricingEngine.calculatePrice(testRequest);
        const testRule = await this.pricingRuleModel.findById(ruleId).exec();
        if (!testRule) {
            throw new common_1.NotFoundException('Pricing rule not found');
        }
        const originalActive = testRule.isActive;
        testRule.isActive = true;
        await testRule.save();
        try {
            const testPrice = await this.pricingEngine.calculatePrice(testRequest);
            const difference = {
                amount: testPrice.breakdown.grandTotal - originalPrice.breakdown.grandTotal,
                percentage: ((testPrice.breakdown.grandTotal - originalPrice.breakdown.grandTotal) / originalPrice.breakdown.grandTotal) * 100,
            };
            return { originalPrice, testPrice, difference };
        }
        finally {
            testRule.isActive = originalActive;
            await testRule.save();
        }
    }
    async getAnalytics(startDate, endDate) {
        const metrics = await this.analyticsService.getMetrics(startDate, endDate, {
            eventType: 'PRICE_CALCULATED',
        });
        const ruleUsage = await this.getRuleUsageStats(startDate, endDate);
        const pricingTrends = await this.getPricingTrends(startDate, endDate);
        return {
            overview: {
                totalPriceCalculations: metrics.totalEvents,
                averagePrice: 0,
                priceVariance: 0,
                discountUtilization: 0,
            },
            ruleUsage,
            trends: pricingTrends,
            recommendations: await this.generateAnalyticsRecommendations(),
        };
    }
    async getOptimizationRecommendations(request) {
        const currentPerformance = await this.analyzeCurrentPerformance(request.productType, request.timeRange);
        const recommendations = [];
        if (request.goals.includes('revenue')) {
            recommendations.push({
                type: 'price_increase',
                description: 'Increase base price by 5% for premium customers',
                expectedImpact: { revenue: 15, volume: -2, margin: 18 },
                confidence: 0.85,
            });
        }
        if (request.goals.includes('volume')) {
            recommendations.push({
                type: 'volume_discount',
                description: 'Introduce bulk discount for orders over 50 units',
                expectedImpact: { revenue: 8, volume: 25, margin: 5 },
                confidence: 0.78,
            });
        }
        if (request.goals.includes('margin')) {
            recommendations.push({
                type: 'dynamic_pricing',
                description: 'Implement demand-based pricing during peak hours',
                expectedImpact: { revenue: 12, volume: -5, margin: 22 },
                confidence: 0.72,
            });
        }
        return { currentPerformance, recommendations };
    }
    async getRuleUsageStats(startDate, endDate) {
        const rules = await this.pricingRuleModel.find({ isActive: true }).exec();
        return rules.map(rule => ({
            ruleId: rule._id,
            name: rule.name,
            type: rule.type,
            usageCount: Math.floor(Math.random() * 1000),
            averageDiscount: Math.random() * 20,
            revenueImpact: Math.random() * 10000,
        }));
    }
    async getPricingTrends(startDate, endDate) {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const trends = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            trends.push({
                date: date.toISOString().split('T')[0],
                averagePrice: 50 + Math.random() * 20,
                totalOrders: Math.floor(Math.random() * 100),
                discountRate: Math.random() * 30,
            });
        }
        return trends;
    }
    async generateAnalyticsRecommendations() {
        return [
            'Consider implementing time-based pricing for peak demand periods',
            'Volume discounts are underutilized - promote bulk ordering',
            'Premium customer segment shows price insensitivity - opportunity for price increase',
            'Geographic pricing variations could optimize regional performance',
        ];
    }
    async analyzeCurrentPerformance(productType, timeRange) {
        return {
            averagePrice: 75.50,
            totalRevenue: 125000,
            totalOrders: 1650,
            averageMargin: 35.2,
            conversionRate: 12.5,
            priceElasticity: -1.2,
            competitorComparison: {
                position: 'middle',
                priceGap: 5.2,
            },
        };
    }
};
exports.PricingRuleService = PricingRuleService;
exports.PricingRuleService = PricingRuleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(pricing_rule_schema_1.PricingRule.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        pricing_engine_service_1.PricingEngineService,
        analytics_service_1.AnalyticsService])
], PricingRuleService);
//# sourceMappingURL=pricing-rule.service.js.map