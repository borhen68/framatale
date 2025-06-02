import { Document } from 'mongoose';
export type ProductSizeDocument = ProductSize & Document;
export declare enum ProductType {
    PHOTOBOOK = "PHOTOBOOK",
    CALENDAR = "CALENDAR",
    CARD = "CARD"
}
export declare class ProductSize {
    type: ProductType;
    sizeCode: string;
    widthMm: number;
    heightMm: number;
    aspectRatio: number;
    bleedMm: number;
    safeZoneMm: number;
    supplierId: string;
}
export declare const ProductSizeSchema: import("mongoose").Schema<ProductSize, import("mongoose").Model<ProductSize, any, any, any, Document<unknown, any, ProductSize, any> & ProductSize & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductSize, Document<unknown, {}, import("mongoose").FlatRecord<ProductSize>, {}> & import("mongoose").FlatRecord<ProductSize> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
