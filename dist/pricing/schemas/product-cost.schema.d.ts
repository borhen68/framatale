import { Document, Types } from 'mongoose';
export type ProductCostDocument = ProductCost & Document;
export declare enum CostType {
    SUPPLIER_COST = "SUPPLIER_COST",
    MANUFACTURING_COST = "MANUFACTURING_COST",
    SHIPPING_COST = "SHIPPING_COST",
    HANDLING_COST = "HANDLING_COST",
    OVERHEAD_COST = "OVERHEAD_COST"
}
export declare class ProductCost {
    productType: string;
    variant?: string;
    supplier: {
        supplierId: string;
        supplierName: string;
        supplierSku: string;
        minimumOrderQuantity: number;
        leadTime: number;
        qualityRating: number;
    };
    costs: {
        baseCost: number;
        shippingCost: number;
        handlingFee: number;
        qualityControlCost: number;
        packagingCost: number;
        totalCost: number;
    };
    volumeTiers?: Array<{
        minQuantity: number;
        maxQuantity?: number;
        unitCost: number;
        discount: number;
    }>;
    pricing: {
        targetSellingPrice: number;
        targetMargin: number;
        minimumMargin: number;
        competitorPrice?: number;
        recommendedPrice?: number;
    };
    geographic?: Array<{
        region: string;
        localCosts: {
            shipping: number;
            taxes: number;
            duties: number;
            handling: number;
        };
    }>;
    validFrom: Date;
    validUntil?: Date;
    isActive: boolean;
    metadata: {
        currency: string;
        lastUpdated: Date;
        updatedBy: string;
        notes?: string;
        contractReference?: string;
    };
}
export declare const ProductCostSchema: import("mongoose").Schema<ProductCost, import("mongoose").Model<ProductCost, any, any, any, Document<unknown, any, ProductCost, any> & ProductCost & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductCost, Document<unknown, {}, import("mongoose").FlatRecord<ProductCost>, {}> & import("mongoose").FlatRecord<ProductCost> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
