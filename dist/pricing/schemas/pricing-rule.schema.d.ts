import { Document, Types } from 'mongoose';
export type PricingRuleDocument = PricingRule & Document;
export declare enum PricingType {
    FIXED = "FIXED",
    PERCENTAGE = "PERCENTAGE",
    TIERED = "TIERED",
    VOLUME = "VOLUME",
    DYNAMIC = "DYNAMIC",
    SUBSCRIPTION = "SUBSCRIPTION"
}
export declare enum PricingScope {
    GLOBAL = "GLOBAL",
    PRODUCT = "PRODUCT",
    USER = "USER",
    REGION = "REGION",
    CHANNEL = "CHANNEL"
}
export declare enum DiscountType {
    FIXED_AMOUNT = "FIXED_AMOUNT",
    PERCENTAGE = "PERCENTAGE",
    BUY_X_GET_Y = "BUY_X_GET_Y",
    BULK_DISCOUNT = "BULK_DISCOUNT",
    LOYALTY_DISCOUNT = "LOYALTY_DISCOUNT"
}
export declare class PricingRule {
    name: string;
    description?: string;
    type: PricingType;
    scope: PricingScope;
    priority: number;
    isActive: boolean;
    conditions?: {
        productTypes?: string[];
        userSegments?: string[];
        regions?: string[];
        channels?: string[];
        minQuantity?: number;
        maxQuantity?: number;
        minOrderValue?: number;
        maxOrderValue?: number;
        customerTier?: string;
        timeRange?: {
            start: Date;
            end: Date;
        };
        dayOfWeek?: number[];
        seasonality?: string;
    };
    pricing: {
        basePrice?: number;
        markup?: number;
        margin?: number;
        tiers?: Array<{
            minQuantity: number;
            maxQuantity?: number;
            price: number;
            discount?: number;
        }>;
        formula?: string;
        factors?: Record<string, any>;
    };
    discount?: {
        type: DiscountType;
        value: number;
        maxDiscount?: number;
        buyQuantity?: number;
        getQuantity?: number;
        loyaltyMultiplier?: number;
    };
    geographic?: {
        baseCurrency: string;
        exchangeRates: Record<string, number>;
        localPricing: Record<string, number>;
        taxRates: Record<string, number>;
        shippingCosts: Record<string, number>;
    };
    dynamic?: {
        demandMultiplier: number;
        competitorPricing: number;
        inventoryLevel: number;
        seasonalityFactor: number;
        aiModel: string;
        updateFrequency: number;
    };
    abTesting?: {
        testName: string;
        variants: Array<{
            name: string;
            percentage: number;
            priceModifier: number;
        }>;
        isActive: boolean;
    };
    metadata?: {
        createdBy: string;
        approvedBy?: string;
        version: number;
        tags: string[];
        businessReason: string;
    };
    validFrom?: Date;
    validUntil?: Date;
}
export declare const PricingRuleSchema: import("mongoose").Schema<PricingRule, import("mongoose").Model<PricingRule, any, any, any, Document<unknown, any, PricingRule, any> & PricingRule & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PricingRule, Document<unknown, {}, import("mongoose").FlatRecord<PricingRule>, {}> & import("mongoose").FlatRecord<PricingRule> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
