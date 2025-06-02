import { Document, Types } from 'mongoose';
import { ProductType, CanvasType } from './canvas.schema';
export type TemplateDocument = Template & Document;
export declare enum TemplateCategory {
    WEDDING = "WEDDING",
    BIRTHDAY = "BIRTHDAY",
    BABY = "BABY",
    TRAVEL = "TRAVEL",
    FAMILY = "FAMILY",
    BUSINESS = "BUSINESS",
    HOLIDAY = "HOLIDAY",
    GRADUATION = "GRADUATION",
    ANNIVERSARY = "ANNIVERSARY",
    MINIMALIST = "MINIMALIST",
    VINTAGE = "VINTAGE",
    MODERN = "MODERN",
    ELEGANT = "ELEGANT",
    CREATIVE = "CREATIVE",
    SEASONAL = "SEASONAL"
}
export declare enum TemplateStyle {
    CLASSIC = "CLASSIC",
    MODERN = "MODERN",
    MINIMALIST = "MINIMALIST",
    VINTAGE = "VINTAGE",
    ELEGANT = "ELEGANT",
    PLAYFUL = "PLAYFUL",
    PROFESSIONAL = "PROFESSIONAL",
    ARTISTIC = "ARTISTIC"
}
export declare class Template {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    productType: ProductType;
    canvasType?: CanvasType;
    category: TemplateCategory;
    style: TemplateStyle;
    dimensions: {
        width: number;
        height: number;
        unit: string;
        dpi: number;
        orientation: 'portrait' | 'landscape';
        pageCount: number;
        spreadCount: number;
    };
    canvases: Array<{
        canvasType: CanvasType;
        name: string;
        order: number;
        dimensions: {
            width: number;
            height: number;
            unit: string;
            dpi: number;
            bleed: number;
            safeZone: number;
            orientation: string;
        };
        background?: any;
        elements: Array<{
            id: string;
            type: string;
            name: string;
            position: {
                x: number;
                y: number;
                z: number;
            };
            size: {
                width: number;
                height: number;
            };
            rotation: number;
            opacity: number;
            visible: boolean;
            locked: boolean;
            isPlaceholder?: boolean;
            placeholderType?: 'image' | 'text';
            placeholderText?: string;
            image?: any;
            text?: any;
            shape?: any;
        }>;
    }>;
    previews: {
        thumbnail: string;
        preview: string;
        fullPreview?: string;
        mockup?: string;
        gallery?: string[];
    };
    pricing: {
        isPremium: boolean;
        price: number;
        isActive: boolean;
        isPublic: boolean;
        requiredSubscription?: string;
    };
    metadata: {
        tags: string[];
        colors: string[];
        difficulty: 'easy' | 'medium' | 'hard';
        estimatedTime?: number;
        usageCount: number;
        rating: number;
        ratingCount: number;
        featured: boolean;
        trending: boolean;
        seasonal: boolean;
        createdBy?: Types.ObjectId;
        designerName?: string;
        designerCredit?: string;
        license: string;
        version: number;
    };
    indesign?: {
        indesignFile: string;
        indesignVersion: string;
        exportSettings: {
            format: string;
            quality: string;
            colorSpace: string;
            resolution: number;
        };
        fonts: string[];
        linkedAssets: string[];
        lastExported?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const TemplateSchema: import("mongoose").Schema<Template, import("mongoose").Model<Template, any, any, any, Document<unknown, any, Template, any> & Template & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Template, Document<unknown, {}, import("mongoose").FlatRecord<Template>, {}> & import("mongoose").FlatRecord<Template> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
