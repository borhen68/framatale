import { Document } from 'mongoose';
export type TranslationDocument = Translation & Document;
export declare enum TranslationStatus {
    PENDING = "PENDING",
    TRANSLATED = "TRANSLATED",
    REVIEWED = "REVIEWED",
    APPROVED = "APPROVED",
    OUTDATED = "OUTDATED"
}
export declare class Translation {
    key: string;
    language: string;
    value: string;
    namespace: string;
    status: TranslationStatus;
    defaultValue?: string;
    context?: string;
    plurals?: {
        zero?: string;
        one?: string;
        two?: string;
        few?: string;
        many?: string;
        other?: string;
    };
    metadata?: {
        translatedBy?: string;
        reviewedBy?: string;
        approvedBy?: string;
        translationDate?: Date;
        reviewDate?: Date;
        approvalDate?: Date;
        version?: number;
    };
    isMachineTranslated: boolean;
    confidence?: number;
    usageCount: number;
    lastUsedAt?: Date;
}
export declare const TranslationSchema: import("mongoose").Schema<Translation, import("mongoose").Model<Translation, any, any, any, Document<unknown, any, Translation, any> & Translation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Translation, Document<unknown, {}, import("mongoose").FlatRecord<Translation>, {}> & import("mongoose").FlatRecord<Translation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
