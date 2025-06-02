import { Document, Types } from 'mongoose';
export type EnhancementJobDocument = EnhancementJob & Document;
export declare enum EnhancementType {
    UPSCALE = "UPSCALE",
    BACKGROUND_REMOVAL = "BACKGROUND_REMOVAL",
    NOISE_REDUCTION = "NOISE_REDUCTION",
    COLOR_CORRECTION = "COLOR_CORRECTION",
    SHARPENING = "SHARPENING",
    STYLE_TRANSFER = "STYLE_TRANSFER"
}
export declare enum JobStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare class EnhancementJob {
    originalMediaId: Types.ObjectId;
    enhancedMediaId?: Types.ObjectId;
    userId: Types.ObjectId;
    enhancementType: EnhancementType;
    status: JobStatus;
    parameters?: {
        scale?: number;
        quality?: number;
        preserveTransparency?: boolean;
        styleReference?: string;
        customSettings?: Record<string, any>;
    };
    progress: number;
    errorMessage?: string;
    startedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number;
    externalJobId?: string;
    metadata?: {
        originalSize?: number;
        enhancedSize?: number;
        processingTime?: number;
        serviceUsed?: string;
        qualityScore?: number;
    };
}
export declare const EnhancementJobSchema: import("mongoose").Schema<EnhancementJob, import("mongoose").Model<EnhancementJob, any, any, any, Document<unknown, any, EnhancementJob, any> & EnhancementJob & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EnhancementJob, Document<unknown, {}, import("mongoose").FlatRecord<EnhancementJob>, {}> & import("mongoose").FlatRecord<EnhancementJob> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
