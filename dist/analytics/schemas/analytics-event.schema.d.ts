import { Document, Types } from 'mongoose';
export type AnalyticsEventDocument = AnalyticsEvent & Document;
export declare enum EventType {
    USER_REGISTERED = "USER_REGISTERED",
    USER_LOGIN = "USER_LOGIN",
    USER_LOGOUT = "USER_LOGOUT",
    PROJECT_CREATED = "PROJECT_CREATED",
    PROJECT_VIEWED = "PROJECT_VIEWED",
    PROJECT_EDITED = "PROJECT_EDITED",
    PROJECT_DELETED = "PROJECT_DELETED",
    PROJECT_SHARED = "PROJECT_SHARED",
    IMAGE_UPLOADED = "IMAGE_UPLOADED",
    IMAGE_DOWNLOADED = "IMAGE_DOWNLOADED",
    IMAGE_ENHANCED = "IMAGE_ENHANCED",
    TEMPLATE_VIEWED = "TEMPLATE_VIEWED",
    TEMPLATE_APPLIED = "TEMPLATE_APPLIED",
    TEMPLATE_RATED = "TEMPLATE_RATED",
    EXPORT_STARTED = "EXPORT_STARTED",
    EXPORT_COMPLETED = "EXPORT_COMPLETED",
    EXPORT_DOWNLOADED = "EXPORT_DOWNLOADED",
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_PAID = "ORDER_PAID",
    ORDER_SHIPPED = "ORDER_SHIPPED",
    ORDER_DELIVERED = "ORDER_DELIVERED",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    PAGE_VIEW = "PAGE_VIEW",
    FEATURE_USED = "FEATURE_USED",
    ERROR_OCCURRED = "ERROR_OCCURRED",
    SEARCH_PERFORMED = "SEARCH_PERFORMED"
}
export declare enum EventCategory {
    USER = "USER",
    PROJECT = "PROJECT",
    MEDIA = "MEDIA",
    TEMPLATE = "TEMPLATE",
    EXPORT = "EXPORT",
    ORDER = "ORDER",
    ENGAGEMENT = "ENGAGEMENT",
    SYSTEM = "SYSTEM"
}
export declare class AnalyticsEvent {
    eventType: EventType;
    category: EventCategory;
    userId?: Types.ObjectId;
    sessionId?: string;
    properties?: Record<string, any>;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    url?: string;
    device?: {
        type: string;
        os: string;
        browser: string;
        isMobile: boolean;
        screenResolution: string;
    };
    location?: {
        country: string;
        region: string;
        city: string;
        timezone: string;
    };
    value?: number;
    currency?: string;
    abTestVariant?: string;
    timestamp: Date;
}
export declare const AnalyticsEventSchema: import("mongoose").Schema<AnalyticsEvent, import("mongoose").Model<AnalyticsEvent, any, any, any, Document<unknown, any, AnalyticsEvent, any> & AnalyticsEvent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AnalyticsEvent, Document<unknown, {}, import("mongoose").FlatRecord<AnalyticsEvent>, {}> & import("mongoose").FlatRecord<AnalyticsEvent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
