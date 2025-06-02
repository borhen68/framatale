import { Document, Types } from 'mongoose';
export type ConfigurationDocument = Configuration & Document;
export declare enum ConfigurationType {
    FEATURE_FLAG = "FEATURE_FLAG",
    SYSTEM_SETTING = "SYSTEM_SETTING",
    USER_PREFERENCE = "USER_PREFERENCE",
    AB_TEST = "AB_TEST",
    BUSINESS_RULE = "BUSINESS_RULE",
    INTEGRATION_CONFIG = "INTEGRATION_CONFIG",
    SECURITY_SETTING = "SECURITY_SETTING"
}
export declare enum ConfigurationScope {
    GLOBAL = "GLOBAL",
    USER = "USER",
    TENANT = "TENANT",
    ENVIRONMENT = "ENVIRONMENT"
}
export declare enum DataType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    JSON = "JSON",
    ARRAY = "ARRAY",
    DATE = "DATE"
}
export declare class Configuration {
    key: string;
    value: any;
    type: ConfigurationType;
    scope: ConfigurationScope;
    dataType: DataType;
    description?: string;
    category?: string;
    environment?: string;
    userId?: Types.ObjectId;
    tenantId?: string;
    isActive: boolean;
    isEncrypted: boolean;
    defaultValue?: any;
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        pattern?: string;
        enum?: string[];
        custom?: string;
    };
    abTest?: {
        testName: string;
        variant: string;
        percentage: number;
        startDate: Date;
        endDate: Date;
        targetAudience?: Record<string, any>;
    };
    featureFlag?: {
        enabled: boolean;
        rolloutPercentage?: number;
        targetUsers?: string[];
        targetGroups?: string[];
        conditions?: Record<string, any>;
    };
    metadata?: {
        createdBy?: string;
        updatedBy?: string;
        version?: number;
        tags?: string[];
        source?: string;
    };
    expiresAt?: Date;
    lastAccessedAt?: Date;
    accessCount: number;
}
export declare const ConfigurationSchema: import("mongoose").Schema<Configuration, import("mongoose").Model<Configuration, any, any, any, Document<unknown, any, Configuration, any> & Configuration & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Configuration, Document<unknown, {}, import("mongoose").FlatRecord<Configuration>, {}> & import("mongoose").FlatRecord<Configuration> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
