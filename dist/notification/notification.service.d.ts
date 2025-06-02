import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationDocument, NotificationType, NotificationChannel, NotificationStatus } from './schemas/notification.schema';
export interface NotificationRequest {
    userId: string;
    type: NotificationType;
    channels: NotificationChannel[];
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
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduledAt?: Date;
    expiresAt?: Date;
}
export declare class NotificationService {
    private notificationModel;
    private configService;
    constructor(notificationModel: Model<NotificationDocument>, configService: ConfigService);
    sendNotification(request: NotificationRequest): Promise<Notification[]>;
    getUserNotifications(userId: string, options?: {
        channel?: NotificationChannel;
        status?: NotificationStatus;
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
    }): Promise<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<number>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    notifyOrderCreated(userId: string, orderNumber: string, orderId: string): Promise<void>;
    notifyOrderShipped(userId: string, orderNumber: string, trackingNumber: string, orderId: string): Promise<void>;
    notifyExportReady(userId: string, projectTitle: string, exportId: string): Promise<void>;
    notifyEnhancementComplete(userId: string, enhancementType: string, jobId: string): Promise<void>;
    private deliverNotification;
    private deliverInAppNotification;
    private deliverEmailNotification;
    private deliverSMSNotification;
    private deliverPushNotification;
    processScheduledNotifications(): Promise<void>;
    cleanupExpiredNotifications(): Promise<number>;
}
