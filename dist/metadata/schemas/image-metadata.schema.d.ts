import { Document, Types } from 'mongoose';
export type ImageMetadataDocument = ImageMetadata & Document;
export declare class ImageMetadata {
    mediaId: Types.ObjectId;
    orientation: 'portrait' | 'landscape' | 'square';
    aspectRatio: number;
    dimensions: {
        width: number;
        height: number;
    };
    exifData?: {
        dateTime?: Date;
        camera?: string;
        lens?: string;
        focalLength?: number;
        aperture?: number;
        iso?: number;
        exposureTime?: string;
        gps?: {
            latitude?: number;
            longitude?: number;
        };
    };
    dominantColor: {
        hex: string;
        rgb: {
            r: number;
            g: number;
            b: number;
        };
        hsl: {
            h: number;
            s: number;
            l: number;
        };
    };
    colorPalette: Array<{
        hex: string;
        rgb: {
            r: number;
            g: number;
            b: number;
        };
        percentage: number;
    }>;
    quality: {
        sharpness: number;
        brightness: number;
        contrast: number;
    };
    faces?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        confidence: number;
    }>;
    aiTags?: string[];
    layoutSuitability?: {
        fullPage: number;
        halfPage: number;
        quarter: number;
        collage: number;
    };
}
export declare const ImageMetadataSchema: import("mongoose").Schema<ImageMetadata, import("mongoose").Model<ImageMetadata, any, any, any, Document<unknown, any, ImageMetadata, any> & ImageMetadata & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ImageMetadata, Document<unknown, {}, import("mongoose").FlatRecord<ImageMetadata>, {}> & import("mongoose").FlatRecord<ImageMetadata> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
