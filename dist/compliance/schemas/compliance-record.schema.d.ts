import { Document, Types } from 'mongoose';
export type ComplianceRecordDocument = ComplianceRecord & Document;
export declare enum ComplianceType {
    GDPR_CONSENT = "GDPR_CONSENT",
    GDPR_DATA_REQUEST = "GDPR_DATA_REQUEST",
    GDPR_DATA_DELETION = "GDPR_DATA_DELETION",
    CCPA_CONSENT = "CCPA_CONSENT",
    CCPA_DATA_REQUEST = "CCPA_DATA_REQUEST",
    COOKIE_CONSENT = "COOKIE_CONSENT",
    TERMS_ACCEPTANCE = "TERMS_ACCEPTANCE",
    PRIVACY_POLICY_ACCEPTANCE = "PRIVACY_POLICY_ACCEPTANCE",
    DATA_RETENTION = "DATA_RETENTION",
    DATA_BREACH = "DATA_BREACH",
    AUDIT_LOG = "AUDIT_LOG"
}
export declare enum ComplianceStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED"
}
export declare class ComplianceRecord {
    type: ComplianceType;
    status: ComplianceStatus;
    userId?: Types.ObjectId;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    data: Record<string, any>;
    legalBasis?: string;
    consent?: {
        consentGiven: boolean;
        consentWithdrawn: boolean;
        consentDate: Date;
        withdrawalDate?: Date;
        consentMethod: string;
        consentVersion: string;
    };
    retention?: {
        retentionPeriod: number;
        retentionUnit: 'days' | 'months' | 'years';
        retentionReason: string;
        scheduledDeletion: Date;
        actualDeletion?: Date;
    };
    request?: {
        requestType: string;
        requestDate: Date;
        responseDate?: Date;
        requestMethod: string;
        verificationMethod: string;
        responseData?: Record<string, any>;
    };
    expiresAt?: Date;
    notes?: string;
    relatedRecords?: Types.ObjectId[];
    handledBy?: Types.ObjectId;
    isVerified: boolean;
    verifiedAt?: Date;
}
export declare const ComplianceRecordSchema: import("mongoose").Schema<ComplianceRecord, import("mongoose").Model<ComplianceRecord, any, any, any, Document<unknown, any, ComplianceRecord, any> & ComplianceRecord & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ComplianceRecord, Document<unknown, {}, import("mongoose").FlatRecord<ComplianceRecord>, {}> & import("mongoose").FlatRecord<ComplianceRecord> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
