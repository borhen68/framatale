import { Model } from 'mongoose';
import { PricingRule, PricingRuleDocument } from './schemas/pricing-rule.schema';
import { PricingEngineService, PricingRequest, PricingResult } from './pricing-engine.service';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class PricingRuleService {
    private pricingRuleModel;
    private pricingEngine;
    private analyticsService;
    constructor(pricingRuleModel: Model<PricingRuleDocument>, pricingEngine: PricingEngineService, analyticsService: AnalyticsService);
    createRule(ruleData: Partial<PricingRule>): Promise<PricingRule>;
    getRules(filters: {
        type?: string;
        scope?: string;
        isActive?: boolean;
    }): Promise<PricingRule[]>;
    updateRule(ruleId: string, updates: Partial<PricingRule>): Promise<PricingRule>;
    deleteRule(ruleId: string): Promise<void>;
    testRule(ruleId: string, testRequest: PricingRequest): Promise<{
        originalPrice: PricingResult;
        testPrice: PricingResult;
        difference: {
            amount: number;
            percentage: number;
        };
    }>;
    getAnalytics(startDate: Date, endDate: Date): Promise<any>;
    getOptimizationRecommendations(request: {
        productType: string;
        timeRange: {
            start: Date;
            end: Date;
        };
        goals: Array<'revenue' | 'volume' | 'margin' | 'market_share'>;
    }): Promise<{
        currentPerformance: any;
        recommendations: Array<{
            type: string;
            description: string;
            expectedImpact: {
                revenue: number;
                volume: number;
                margin: number;
            };
            confidence: number;
        }>;
    }>;
    private getRuleUsageStats;
    private getPricingTrends;
    private generateAnalyticsRecommendations;
    private analyzeCurrentPerformance;
}
