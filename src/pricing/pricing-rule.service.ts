import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingRule, PricingRuleDocument } from './schemas/pricing-rule.schema';
import { PricingEngineService, PricingRequest, PricingResult } from './pricing-engine.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class PricingRuleService {
  constructor(
    @InjectModel(PricingRule.name) private pricingRuleModel: Model<PricingRuleDocument>,
    private pricingEngine: PricingEngineService,
    private analyticsService: AnalyticsService,
  ) {}

  async createRule(ruleData: Partial<PricingRule>): Promise<PricingRule> {
    const rule = new this.pricingRuleModel({
      ...ruleData,
      validFrom: ruleData.validFrom || new Date(),
    });

    return rule.save();
  }

  async getRules(filters: {
    type?: string;
    scope?: string;
    isActive?: boolean;
  }): Promise<PricingRule[]> {
    const query: any = {};

    if (filters.type) query.type = filters.type;
    if (filters.scope) query.scope = filters.scope;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    return this.pricingRuleModel
      .find(query)
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  async updateRule(ruleId: string, updates: Partial<PricingRule>): Promise<PricingRule> {
    const rule = await this.pricingRuleModel
      .findByIdAndUpdate(ruleId, updates, { new: true })
      .exec();

    if (!rule) {
      throw new NotFoundException('Pricing rule not found');
    }

    return rule;
  }

  async deleteRule(ruleId: string): Promise<void> {
    const result = await this.pricingRuleModel.findByIdAndDelete(ruleId).exec();
    
    if (!result) {
      throw new NotFoundException('Pricing rule not found');
    }
  }

  async testRule(
    ruleId: string,
    testRequest: PricingRequest,
  ): Promise<{
    originalPrice: PricingResult;
    testPrice: PricingResult;
    difference: { amount: number; percentage: number };
  }> {
    // Get original price without the test rule
    const originalPrice = await this.pricingEngine.calculatePrice(testRequest);

    // Temporarily activate the test rule
    const testRule = await this.pricingRuleModel.findById(ruleId).exec();
    if (!testRule) {
      throw new NotFoundException('Pricing rule not found');
    }

    const originalActive = testRule.isActive;
    testRule.isActive = true;
    await testRule.save();

    try {
      // Calculate price with the test rule
      const testPrice = await this.pricingEngine.calculatePrice(testRequest);

      const difference = {
        amount: testPrice.breakdown.grandTotal - originalPrice.breakdown.grandTotal,
        percentage: ((testPrice.breakdown.grandTotal - originalPrice.breakdown.grandTotal) / originalPrice.breakdown.grandTotal) * 100,
      };

      return { originalPrice, testPrice, difference };
    } finally {
      // Restore original state
      testRule.isActive = originalActive;
      await testRule.save();
    }
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Get pricing-related analytics
    const metrics = await this.analyticsService.getMetrics(startDate, endDate, {
      eventType: 'PRICE_CALCULATED' as any,
    });

    // Get rule usage statistics
    const ruleUsage = await this.getRuleUsageStats(startDate, endDate);

    // Get pricing trends
    const pricingTrends = await this.getPricingTrends(startDate, endDate);

    return {
      overview: {
        totalPriceCalculations: metrics.totalEvents,
        averagePrice: 0, // Would calculate from events
        priceVariance: 0, // Would calculate variance
        discountUtilization: 0, // Percentage of orders with discounts
      },
      ruleUsage,
      trends: pricingTrends,
      recommendations: await this.generateAnalyticsRecommendations(),
    };
  }

  async getOptimizationRecommendations(request: {
    productType: string;
    timeRange: { start: Date; end: Date };
    goals: Array<'revenue' | 'volume' | 'margin' | 'market_share'>;
  }): Promise<{
    currentPerformance: any;
    recommendations: Array<{
      type: string;
      description: string;
      expectedImpact: { revenue: number; volume: number; margin: number };
      confidence: number;
    }>;
  }> {
    // Analyze current performance
    const currentPerformance = await this.analyzeCurrentPerformance(
      request.productType,
      request.timeRange,
    );

    // Generate recommendations based on goals
    const recommendations: Array<{
      type: string;
      description: string;
      expectedImpact: { revenue: number; volume: number; margin: number };
      confidence: number;
    }> = [];

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

  // Private helper methods
  private async getRuleUsageStats(startDate: Date, endDate: Date): Promise<any> {
    // This would analyze which rules are being applied most frequently
    const rules = await this.pricingRuleModel.find({ isActive: true }).exec();
    
    return rules.map(rule => ({
      ruleId: rule._id,
      name: rule.name,
      type: rule.type,
      usageCount: Math.floor(Math.random() * 1000), // Placeholder
      averageDiscount: Math.random() * 20, // Placeholder
      revenueImpact: Math.random() * 10000, // Placeholder
    }));
  }

  private async getPricingTrends(startDate: Date, endDate: Date): Promise<any> {
    // This would analyze pricing trends over time
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trends: Array<{
      date: string;
      averagePrice: number;
      totalOrders: number;
      discountRate: number;
    }> = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      trends.push({
        date: date.toISOString().split('T')[0],
        averagePrice: 50 + Math.random() * 20, // Placeholder
        totalOrders: Math.floor(Math.random() * 100), // Placeholder
        discountRate: Math.random() * 30, // Placeholder
      });
    }

    return trends;
  }

  private async generateAnalyticsRecommendations(): Promise<string[]> {
    return [
      'Consider implementing time-based pricing for peak demand periods',
      'Volume discounts are underutilized - promote bulk ordering',
      'Premium customer segment shows price insensitivity - opportunity for price increase',
      'Geographic pricing variations could optimize regional performance',
    ];
  }

  private async analyzeCurrentPerformance(
    productType: string,
    timeRange: { start: Date; end: Date },
  ): Promise<any> {
    // This would analyze current pricing performance
    return {
      averagePrice: 75.50,
      totalRevenue: 125000,
      totalOrders: 1650,
      averageMargin: 35.2,
      conversionRate: 12.5,
      priceElasticity: -1.2,
      competitorComparison: {
        position: 'middle',
        priceGap: 5.2, // % difference from average competitor price
      },
    };
  }
}
