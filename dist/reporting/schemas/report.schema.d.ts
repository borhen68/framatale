import { Document, Types } from 'mongoose';
export type ReportDocument = Report & Document;
export declare enum ReportType {
    SALES = "SALES",
    USER_ENGAGEMENT = "USER_ENGAGEMENT",
    PRODUCT_PERFORMANCE = "PRODUCT_PERFORMANCE",
    FINANCIAL = "FINANCIAL",
    OPERATIONAL = "OPERATIONAL",
    CUSTOM = "CUSTOM"
}
export declare enum ReportStatus {
    PENDING = "PENDING",
    GENERATING = "GENERATING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    SCHEDULED = "SCHEDULED"
}
export declare enum ReportFormat {
    PDF = "PDF",
    CSV = "CSV",
    EXCEL = "EXCEL",
    JSON = "JSON"
}
export declare enum ReportFrequency {
    ONCE = "ONCE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    YEARLY = "YEARLY"
}
export declare class Report {
    name: string;
    description?: string;
    type: ReportType;
    status: ReportStatus;
    format: ReportFormat;
    createdBy: Types.ObjectId;
    parameters: {
        startDate: Date;
        endDate: Date;
        filters?: Record<string, any>;
        groupBy?: string[];
        metrics?: string[];
        dimensions?: string[];
    };
    data?: Record<string, any>;
    filePath?: string;
    fileSize?: number;
    downloadUrl?: string;
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
    schedule?: {
        frequency: ReportFrequency;
        nextRunAt: Date;
        lastRunAt?: Date;
        isActive: boolean;
        recipients: string[];
    };
    metadata?: {
        rowCount?: number;
        columnCount?: number;
        generationTime?: number;
        dataSource?: string;
        version?: string;
    };
    expiresAt?: Date;
    isShared: boolean;
    shareToken?: string;
}
export declare const ReportSchema: import("mongoose").Schema<Report, import("mongoose").Model<Report, any, any, any, Document<unknown, any, Report, any> & Report & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Report, Document<unknown, {}, import("mongoose").FlatRecord<Report>, {}> & import("mongoose").FlatRecord<Report> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
