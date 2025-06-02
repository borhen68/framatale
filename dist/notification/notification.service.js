"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const notification_schema_1 = require("./schemas/notification.schema");
let NotificationService = class NotificationService {
    notificationModel;
    configService;
    constructor(notificationModel, configService) {
        this.notificationModel = notificationModel;
        this.configService = configService;
    }
    async sendNotification(request) {
        const notifications = [];
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
            if (!request.scheduledAt || request.scheduledAt <= new Date()) {
                this.deliverNotification(saved).catch(console.error);
            }
        }
        return notifications;
    }
    async getUserNotifications(userId, options = {}) {
        const query = { userId };
        if (options.channel)
            query.channel = options.channel;
        if (options.status)
            query.status = options.status;
        if (options.unreadOnly)
            query.readAt = { $exists: false };
        const total = await this.notificationModel.countDocuments(query).exec();
        const unreadCount = await this.notificationModel.countDocuments({
            userId,
            readAt: { $exists: false },
            channel: notification_schema_1.NotificationChannel.IN_APP,
        }).exec();
        const notifications = await this.notificationModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(options.limit || 50)
            .skip(options.offset || 0)
            .exec();
        return { notifications, total, unreadCount };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationModel
            .findOneAndUpdate({ _id: notificationId, userId }, {
            status: notification_schema_1.NotificationStatus.READ,
            readAt: new Date(),
        }, { new: true })
            .exec();
        if (!notification) {
            throw new Error('Notification not found');
        }
        return notification;
    }
    async markAllAsRead(userId) {
        const result = await this.notificationModel
            .updateMany({
            userId,
            channel: notification_schema_1.NotificationChannel.IN_APP,
            readAt: { $exists: false },
        }, {
            status: notification_schema_1.NotificationStatus.READ,
            readAt: new Date(),
        })
            .exec();
        return result.modifiedCount;
    }
    async deleteNotification(notificationId, userId) {
        await this.notificationModel
            .findOneAndDelete({ _id: notificationId, userId })
            .exec();
    }
    async notifyOrderCreated(userId, orderNumber, orderId) {
        await this.sendNotification({
            userId,
            type: notification_schema_1.NotificationType.ORDER_CREATED,
            channels: [notification_schema_1.NotificationChannel.IN_APP, notification_schema_1.NotificationChannel.EMAIL],
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
    async notifyOrderShipped(userId, orderNumber, trackingNumber, orderId) {
        await this.sendNotification({
            userId,
            type: notification_schema_1.NotificationType.ORDER_SHIPPED,
            channels: [notification_schema_1.NotificationChannel.IN_APP, notification_schema_1.NotificationChannel.EMAIL, notification_schema_1.NotificationChannel.SMS],
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
    async notifyExportReady(userId, projectTitle, exportId) {
        await this.sendNotification({
            userId,
            type: notification_schema_1.NotificationType.EXPORT_READY,
            channels: [notification_schema_1.NotificationChannel.IN_APP, notification_schema_1.NotificationChannel.EMAIL],
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
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
    }
    async notifyEnhancementComplete(userId, enhancementType, jobId) {
        await this.sendNotification({
            userId,
            type: notification_schema_1.NotificationType.ENHANCEMENT_COMPLETE,
            channels: [notification_schema_1.NotificationChannel.IN_APP],
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
    async deliverNotification(notification) {
        try {
            switch (notification.channel) {
                case notification_schema_1.NotificationChannel.IN_APP:
                    await this.deliverInAppNotification(notification);
                    break;
                case notification_schema_1.NotificationChannel.EMAIL:
                    await this.deliverEmailNotification(notification);
                    break;
                case notification_schema_1.NotificationChannel.SMS:
                    await this.deliverSMSNotification(notification);
                    break;
                case notification_schema_1.NotificationChannel.PUSH:
                    await this.deliverPushNotification(notification);
                    break;
            }
            notification.status = notification_schema_1.NotificationStatus.SENT;
            notification.sentAt = new Date();
            await notification.save();
        }
        catch (error) {
            console.error('Failed to deliver notification:', error);
            notification.status = notification_schema_1.NotificationStatus.FAILED;
            notification.errorMessage = error.message;
            notification.retryCount += 1;
            await notification.save();
            if (notification.retryCount < 3) {
                setTimeout(() => {
                    this.deliverNotification(notification).catch(console.error);
                }, Math.pow(2, notification.retryCount) * 60000);
            }
        }
    }
    async deliverInAppNotification(notification) {
        console.log('In-app notification delivered:', notification.title);
    }
    async deliverEmailNotification(notification) {
        console.log('Email notification delivered:', notification.title);
    }
    async deliverSMSNotification(notification) {
        console.log('SMS notification delivered:', notification.title);
    }
    async deliverPushNotification(notification) {
        console.log('Push notification delivered:', notification.title);
    }
    async processScheduledNotifications() {
        const now = new Date();
        const scheduledNotifications = await this.notificationModel
            .find({
            status: notification_schema_1.NotificationStatus.PENDING,
            scheduledAt: { $lte: now },
        })
            .exec();
        for (const notification of scheduledNotifications) {
            await this.deliverNotification(notification);
        }
    }
    async cleanupExpiredNotifications() {
        const result = await this.notificationModel
            .deleteMany({
            expiresAt: { $lt: new Date() },
        })
            .exec();
        return result.deletedCount;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map