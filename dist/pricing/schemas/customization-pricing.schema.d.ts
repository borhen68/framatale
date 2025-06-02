import { Document } from 'mongoose';
export type CustomizationPricingDocument = CustomizationPricing & Document;
export declare enum CustomizationType {
    EXTRA_PAGES = "EXTRA_PAGES",
    COVER_UPGRADE = "COVER_UPGRADE",
    PAPER_UPGRADE = "PAPER_UPGRADE",
    SIZE_UPGRADE = "SIZE_UPGRADE",
    BINDING_UPGRADE = "BINDING_UPGRADE",
    LAMINATION = "LAMINATION",
    FOIL_STAMPING = "FOIL_STAMPING",
    EMBOSSING = "EMBOSSING",
    DUST_JACKET = "DUST_JACKET",
    GIFT_BOX = "GIFT_BOX"
}
export declare enum PricingModel {
    PER_UNIT = "PER_UNIT",
    FLAT_FEE = "FLAT_FEE",
    PERCENTAGE = "PERCENTAGE",
    TIERED = "TIERED"
}
export declare class CustomizationPricing {
    productType: string;
    variant?: string;
    customizationType: CustomizationType;
    name: string;
    description?: string;
    pricingModel: PricingModel;
    supplierCost: number;
    markup: number;
    customerPrice: number;
    tiers?: Array<{
        minQuantity: number;
        maxQuantity?: number;
        supplierCost: number;
        customerPrice: number;
        markup: number;
    }>;
    limits?: {
        min: number;
        max: number;
        default: number;
    };
    dependencies?: {
        requires: string[];
        excludes: string[];
        implies: string[];
    };
    supplierInfo?: {
        supplierId: string;
        supplierSku: string;
        processingTime: number;
        availability: string[];
    };
    isActive: boolean;
    display?: {
        displayName: string;
        icon: string;
        category: string;
        sortOrder: number;
        tooltip: string;
        previewImage: string;
    };
    metadata?: {
        tags: string[];
        popularity: number;
        lastUsed: Date;
        totalUsage: number;
    };
}
export declare const CustomizationPricingSchema: import("mongoose").Schema<CustomizationPricing, import("mongoose").Model<CustomizationPricing, any, any, any, Document<unknown, any, CustomizationPricing, any> & CustomizationPricing & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CustomizationPricing, Document<unknown, {}, import("mongoose").FlatRecord<CustomizationPricing>, {}> & import("mongoose").FlatRecord<CustomizationPricing> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
