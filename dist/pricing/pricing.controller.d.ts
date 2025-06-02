import { PricingEngineService, PricingRequest, PricingResult } from './pricing-engine.service';
import { PricingRuleService } from './pricing-rule.service';
import { PricingRule } from './schemas/pricing-rule.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class PricingController {
    private pricingEngine;
    private pricingRuleService;
    constructor(pricingEngine: PricingEngineService, pricingRuleService: PricingRuleService);
    calculatePrice(request: PricingRequest, user: UserDocument): Promise<PricingResult>;
    generateQuote(request: {
        items: Array<{
            productType: string;
            quantity: number;
            customizations?: Record<string, any>;
        }>;
        shippingAddress?: {
            country: string;
            state: string;
            city: string;
        };
        promoCode?: string;
    }, user: UserDocument): Promise<{
        items: Array<PricingResult & {
            productType: string;
            quantity: number;
        }>;
        totals: {
            subtotal: number;
            totalDiscounts: number;
            totalTaxes: number;
            totalShipping: number;
            grandTotal: number;
        };
        validUntil: Date;
        quoteId: string;
    }>;
    getPricingRules(type?: string, scope?: string, isActive?: boolean): Promise<PricingRule[]>;
    createPricingRule(ruleData: Partial<PricingRule>, user: UserDocument): Promise<PricingRule>;
    updatePricingRule(ruleId: string, updates: Partial<PricingRule>, user: UserDocument): Promise<PricingRule>;
    deletePricingRule(ruleId: string): Promise<{
        message: string;
    }>;
    testPricingRule(ruleId: string, testRequest: PricingRequest): Promise<{
        originalPrice: PricingResult;
        testPrice: PricingResult;
        difference: {
            amount: number;
            percentage: number;
        };
    }>;
    getPricingAnalytics(startDate: string, endDate: string): Promise<any>;
    getPricingOptimization(request: {
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
}
