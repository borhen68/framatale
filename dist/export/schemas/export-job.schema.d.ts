import { Document, Types } from 'mongoose';
export type ExportJobDocument = ExportJob & Document;
export declare enum ExportFormat {
    PDF_PRINT = "PDF_PRINT",
    PDF_WEB = "PDF_WEB",
    JPEG_HIGH = "JPEG_HIGH",
    JPEG_WEB = "JPEG_WEB",
    PNG = "PNG"
}
export declare enum ExportStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare class ExportJob {
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    format: ExportFormat;
    status: ExportStatus;
    settings?: {
        dpi?: number;
        quality?: number;
        colorProfile?: string;
        bleed?: boolean;
        cropMarks?: boolean;
        includeMetadata?: boolean;
        pageRange?: string;
    };
    progress: number;
    filePath?: string;
    fileSize?: number;
    downloadUrl?: string;
    errorMessage?: string;
    startedAt?: Date;
    completedAt?: Date;
    expiresAt?: Date;
    pageCount?: number;
    metadata?: {
        processingTime?: number;
        totalImages?: number;
        resolution?: string;
        colorSpace?: string;
        compression?: string;
    };
}
export declare const ExportJobSchema: import("mongoose").Schema<ExportJob, import("mongoose").Model<ExportJob, any, any, any, Document<unknown, any, ExportJob, any> & ExportJob & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExportJob, Document<unknown, {}, import("mongoose").FlatRecord<ExportJob>, {}> & import("mongoose").FlatRecord<ExportJob> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
