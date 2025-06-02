import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_CONFIRMED = "ORDER_CONFIRMED",
    ORDER_SHIPPED = "ORDER_SHIPPED",
    ORDER_DELIVERED = "ORDER_DELIVERED",
    EXPORT_READY = "EXPORT_READY",
    ENHANCEMENT_COMPLETE = "ENHANCEMENT_COMPLETE",
    PROJECT_SHARED = "PROJECT_SHARED",
    SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
    PROMOTIONAL = "PROMOTIONAL"
}
export declare enum NotificationChannel {
    IN_APP = "IN_APP",
    EMAIL = "EMAIL",
    SMS = "SMS",
    PUSH = "PUSH"
}
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
    READ = "READ"
}
export declare class Notification {
    userId: Types.ObjectId;
    type: NotificationType;
    channel: NotificationChannel;
    status: NotificationStatus;
    title: string;
    message: string;
    content?: {
        html?: string;
        imageUrl?: string;
        actionUrl?: string;
        actionText?: string;
        metadata?: Record<string, any>;
    };
    relatedEntity?: {
        entityType: 'order' | 'project' | 'export' | 'enhancement';
        entityId: string;
    };
    priority: 'low' | 'normal' | 'high' | 'urgent';
    scheduledAt?: Date;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    expiresAt?: Date;
    errorMessage?: string;
    retryCount: number;
    externalMessageId?: string;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
