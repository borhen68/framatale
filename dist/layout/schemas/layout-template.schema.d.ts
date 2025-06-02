import { Document } from 'mongoose';
import { ProductType } from '../../common/schemas/product-size.schema';
export type LayoutTemplateDocument = LayoutTemplate & Document;
export interface ImageSlot {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    aspectRatio?: number;
    minAspectRatio?: number;
    maxAspectRatio?: number;
    rotation?: number;
    zIndex: number;
    required: boolean;
    cropMode: 'fit' | 'fill' | 'stretch';
    borderRadius?: number;
    shadow?: {
        offsetX: number;
        offsetY: number;
        blur: number;
        color: string;
    };
}
export interface TextSlot {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    defaultText?: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    color: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    verticalAlign: 'top' | 'middle' | 'bottom';
    maxLines?: number;
    overflow: 'hidden' | 'ellipsis' | 'wrap';
    zIndex: number;
}
export interface BackgroundElement {
    type: 'color' | 'gradient' | 'pattern' | 'image';
    value: string;
    opacity?: number;
    blendMode?: string;
}
export declare class LayoutTemplate {
    name: string;
    description?: string;
    productType: ProductType;
    category: string;
    tags: string[];
    imageCount: number;
    preferredOrientation: 'portrait' | 'landscape' | 'square' | 'mixed';
    imageSlots: ImageSlot[];
    textSlots: TextSlot[];
    background?: BackgroundElement;
    previewUrl?: string;
    thumbnailUrl?: string;
    isActive: boolean;
    isPremium: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    usageCount: number;
    averageRating?: number;
    metadata?: {
        createdBy?: string;
        version: string;
        compatibleSizes: string[];
        estimatedTime?: number;
    };
}
export declare const LayoutTemplateSchema: import("mongoose").Schema<LayoutTemplate, import("mongoose").Model<LayoutTemplate, any, any, any, Document<unknown, any, LayoutTemplate, any> & LayoutTemplate & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LayoutTemplate, Document<unknown, {}, import("mongoose").FlatRecord<LayoutTemplate>, {}> & import("mongoose").FlatRecord<LayoutTemplate> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
