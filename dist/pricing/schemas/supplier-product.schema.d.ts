import { Document } from 'mongoose';
export type SupplierProductDocument = SupplierProduct & Document;
export declare enum SupplierType {
    PRINTFUL = "PRINTFUL",
    PRINTIFY = "PRINTIFY",
    GOOTEN = "GOOTEN",
    PRODIGI = "PRODIGI",
    CLOUD_PRINT = "CLOUD_PRINT",
    RIP_PRINT = "RIP_PRINT"
}
export declare class SupplierProduct {
    supplier: SupplierType;
    supplierProductId: string;
    productType: string;
    variant: string;
    title: string;
    description?: string;
    supplierPrice: number;
    sellingPrice: number;
    markup: number;
    markupPercentage: number;
    marginPercentage: number;
    specifications: {
        width: number;
        height: number;
        unit: string;
        material: string;
        printMethod: string;
        weight?: number;
        pages?: number;
    };
    shipping: {
        shippingCost: number;
        processingTime: number;
        shippingTime: number;
        totalTime: number;
        regions: string[];
    };
    volumePricing?: Array<{
        minQuantity: number;
        maxQuantity?: number;
        supplierPrice: number;
        sellingPrice: number;
        markup: number;
    }>;
    apiInfo: {
        apiEndpoint: string;
        lastSynced: Date;
        syncStatus: 'active' | 'inactive' | 'error';
        apiVersion: string;
    };
    isAvailable: boolean;
    isActive: boolean;
    metadata: {
        category: string;
        tags: string[];
        popularity: number;
        lastOrdered?: Date;
        totalOrders: number;
        revenue: number;
    };
}
export declare const SupplierProductSchema: import("mongoose").Schema<SupplierProduct, import("mongoose").Model<SupplierProduct, any, any, any, Document<unknown, any, SupplierProduct, any> & SupplierProduct & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SupplierProduct, Document<unknown, {}, import("mongoose").FlatRecord<SupplierProduct>, {}> & import("mongoose").FlatRecord<SupplierProduct> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
