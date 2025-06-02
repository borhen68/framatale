import { Document, Types } from 'mongoose';
export type MediaDocument = Media & Document;
export declare enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT"
}
export declare enum MediaStatus {
    UPLOADING = "UPLOADING",
    PROCESSING = "PROCESSING",
    READY = "READY",
    ERROR = "ERROR"
}
export declare class Media {
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimeType: string;
    type: MediaType;
    status: MediaStatus;
    userId: Types.ObjectId;
    dimensions?: {
        width: number;
        height: number;
    };
    thumbnailPath?: string;
    metadata?: {
        exif?: any;
        colorProfile?: string;
        compression?: string;
    };
    tags?: string[];
    altText?: string;
    isPublic: boolean;
    downloadCount: number;
}
export declare const MediaSchema: import("mongoose").Schema<Media, import("mongoose").Model<Media, any, any, any, Document<unknown, any, Media, any> & Media & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Media, Document<unknown, {}, import("mongoose").FlatRecord<Media>, {}> & import("mongoose").FlatRecord<Media> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
