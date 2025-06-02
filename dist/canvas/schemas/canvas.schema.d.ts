import { Document, Types } from 'mongoose';
export type CanvasDocument = Canvas & Document;
export declare enum ProductType {
    PHOTO_BOOK = "PHOTO_BOOK",
    GREETING_CARD = "GREETING_CARD",
    BUSINESS_CARD = "BUSINESS_CARD",
    CALENDAR = "CALENDAR",
    POSTER = "POSTER",
    FLYER = "FLYER"
}
export declare enum CanvasType {
    COVER = "COVER",
    PAGE = "PAGE",
    SPREAD = "SPREAD",
    SINGLE = "SINGLE",
    MONTH = "MONTH"
}
export declare enum ElementType {
    IMAGE = "IMAGE",
    TEXT = "TEXT",
    SHAPE = "SHAPE",
    BACKGROUND = "BACKGROUND",
    PLACEHOLDER = "PLACEHOLDER"
}
export declare class Canvas {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    productType: ProductType;
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
        orientation: 'portrait' | 'landscape';
    };
    background?: {
        type: 'color' | 'image' | 'gradient';
        color?: string;
        image?: {
            url: string;
            opacity: number;
            position: string;
            size: string;
        };
        gradient?: {
            type: 'linear' | 'radial';
            colors: string[];
            direction: string;
        };
    };
    elements: Array<{
        id: string;
        type: ElementType;
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
        image?: {
            url: string;
            originalUrl: string;
            crop?: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            filters?: {
                brightness: number;
                contrast: number;
                saturation: number;
                blur: number;
                sepia: number;
            };
        };
        text?: {
            content: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: string;
            fontStyle: string;
            color: string;
            align: 'left' | 'center' | 'right' | 'justify';
            lineHeight: number;
            letterSpacing: number;
            textDecoration: string;
        };
        shape?: {
            type: 'rectangle' | 'circle' | 'triangle' | 'polygon';
            fill: string;
            stroke: {
                color: string;
                width: number;
                style: 'solid' | 'dashed' | 'dotted';
            };
            cornerRadius: number;
        };
    }>;
    template?: {
        templateId: Types.ObjectId;
        templateName: string;
        templateCategory: string;
        appliedAt: Date;
        customizations: string[];
    };
    metadata?: {
        isTemplate: boolean;
        tags: string[];
        notes: string;
        lastEditedBy: Types.ObjectId;
        version: number;
        printReady: boolean;
        previewUrl: string;
        thumbnailUrl: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const CanvasSchema: import("mongoose").Schema<Canvas, import("mongoose").Model<Canvas, any, any, any, Document<unknown, any, Canvas, any> & Canvas & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Canvas, Document<unknown, {}, import("mongoose").FlatRecord<Canvas>, {}> & import("mongoose").FlatRecord<Canvas> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
