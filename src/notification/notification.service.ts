import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { 
  Notification, 
  NotificationDocument, 
  NotificationType, 
  NotificationChannel, 
  NotificationStatus 
} from './schemas/notification.schema';
import { UserDocument } from '../user/schemas/user.schema';

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

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private configService: ConfigService,
  ) {}

  async sendNotification(request: NotificationRequest): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // Create notification for each channel
    for (const channel of request.channels) {
      const notification = new this.notificationModel({
        userId: request.userId,
        type: request.type,
        channel,
        title: request.title,
        message: request.message,
        content: request.content,
        relatedEntity: request.relatedEntity,
        priority: request.priority || 'normal',
        scheduledAt: request.scheduledAt,
        expiresAt: request.expiresAt,
      });

      const saved = await notification.save();
      notifications.push(saved);

      // Send immediately if not scheduled
      if (!request.scheduledAt || request.scheduledAt <= new Date()) {
        this.deliverNotification(saved).catch(console.error);
      }
    }

    return notifications;
  }

  async getUserNotifications(
    userId: string,
    options: {
      channel?: NotificationChannel;
      status?: NotificationStatus;
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {},
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const query: any = { userId };

    if (options.channel) query.channel = options.channel;
    if (options.status) query.status = options.status;
    if (options.unreadOnly) query.readAt = { $exists: false };

    const total = await this.notificationModel.countDocuments(query).exec();
    const unreadCount = await this.notificationModel.countDocuments({
      userId,
      readAt: { $exists: false },
      channel: NotificationChannel.IN_APP,
    }).exec();

    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 50)
      .skip(options.offset || 0)
      .exec();

    return { notifications, total, unreadCount };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, userId },
        { 
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany(
        { 
          userId, 
          channel: NotificationChannel.IN_APP,
          readAt: { $exists: false },
        },
        { 
          status: NotificationStatus.READ,
          readAt: new Date(),
        }
      )
      .exec();

    return result.modifiedCount;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel
      .findOneAndDelete({ _id: notificationId, userId })
      .exec();
  }

  // Convenience methods for common notification types
  async notifyOrderCreated(userId: string, orderNumber: string, orderId: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.ORDER_CREATED,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      title: 'Order Confirmed',
      message: `Your order ${orderNumber} has been confirmed and is being processed.`,
      content: {
        actionUrl: `/orders/${orderId}`,
        actionText: 'View Order',
      },
      relatedEntity: {
        entityType: 'order',
        entityId: orderId,
      },
      priority: 'normal',
    });
  }

  async notifyOrderShipped(userId: string, orderNumber: string, trackingNumber: string, orderId: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.ORDER_SHIPPED,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
      title: 'Order Shipped',
      message: `Your order ${orderNumber} has been shipped! Tracking: ${trackingNumber}`,
      content: {
        actionUrl: `/orders/${orderId}`,
        actionText: 'Track Package',
        metadata: { trackingNumber },
      },
      relatedEntity: {
        entityType: 'order',
        entityId: orderId,
      },
      priority: 'high',
    });
  }

  async notifyExportReady(userId: string, projectTitle: string, exportId: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.EXPORT_READY,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      title: 'Export Ready',
      message: `Your export for "${projectTitle}" is ready for download.`,
      content: {
        actionUrl: `/export/download/${exportId}`,
        actionText: 'Download',
      },
      relatedEntity: {
        entityType: 'export',
        entityId: exportId,
      },
      priority: 'normal',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  async notifyEnhancementComplete(userId: string, enhancementType: string, jobId: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.ENHANCEMENT_COMPLETE,
      channels: [NotificationChannel.IN_APP],
      title: 'Enhancement Complete',
      message: `Your ${enhancementType.toLowerCase()} enhancement is ready.`,
      content: {
        actionUrl: `/ai-enhancement/jobs/${jobId}`,
        actionText: 'View Result',
      },
      relatedEntity: {
        entityType: 'enhancement',
        entityId: jobId,
      },
      priority: 'normal',
    });
  }

  private async deliverNotification(notification: NotificationDocument): Promise<void> {
    try {
      switch (notification.channel) {
        case NotificationChannel.IN_APP:
          await this.deliverInAppNotification(notification);
          break;
        case NotificationChannel.EMAIL:
          await this.deliverEmailNotification(notification);
          break;
        case NotificationChannel.SMS:
          await this.deliverSMSNotification(notification);
          break;
        case NotificationChannel.PUSH:
          await this.deliverPushNotification(notification);
          break;
      }

      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await notification.save();

    } catch (error) {
      console.error('Failed to deliver notification:', error);
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
      notification.retryCount += 1;
      await notification.save();

      // Retry logic for failed notifications
      if (notification.retryCount < 3) {
        setTimeout(() => {
          this.deliverNotification(notification).catch(console.error);
        }, Math.pow(2, notification.retryCount) * 60000); // Exponential backoff
      }
    }
  }

  private async deliverInAppNotification(notification: NotificationDocument): Promise<void> {
    // In-app notifications are stored in database and delivered via WebSocket/SSE
    // This is a placeholder - implement WebSocket/SSE delivery
    console.log('In-app notification delivered:', notification.title);
  }

  private async deliverEmailNotification(notification: NotificationDocument): Promise<void> {
    // Implement email delivery using your preferred service (SendGrid, AWS SES, etc.)
    console.log('Email notification delivered:', notification.title);
    
    // Example implementation:
    // const emailService = new EmailService();
    // await emailService.send({
    //   to: user.email,
    //   subject: notification.title,
    //   html: notification.content?.html || notification.message,
    // });
  }

  private async deliverSMSNotification(notification: NotificationDocument): Promise<void> {
    // Implement SMS delivery using Twilio, AWS SNS, etc.
    console.log('SMS notification delivered:', notification.title);
  }

  private async deliverPushNotification(notification: NotificationDocument): Promise<void> {
    // Implement push notification delivery using Firebase, OneSignal, etc.
    console.log('Push notification delivered:', notification.title);
  }

  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const scheduledNotifications = await this.notificationModel
      .find({
        status: NotificationStatus.PENDING,
        scheduledAt: { $lte: now },
      })
      .exec();

    for (const notification of scheduledNotifications) {
      await this.deliverNotification(notification);
    }
  }

  async cleanupExpiredNotifications(): Promise<number> {
    const result = await this.notificationModel
      .deleteMany({
        expiresAt: { $lt: new Date() },
      })
      .exec();

    return result.deletedCount;
  }
}
