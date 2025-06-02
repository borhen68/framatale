import { NotificationService } from './notification.service';
import { Notification, NotificationChannel, NotificationStatus } from './schemas/notification.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getUserNotifications(user: UserDocument, channel?: NotificationChannel, status?: NotificationStatus, limit?: number, offset?: number, unreadOnly?: boolean): Promise<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, user: UserDocument): Promise<Notification>;
    markAllAsRead(user: UserDocument): Promise<{
        count: number;
    }>;
    deleteNotification(notificationId: string, user: UserDocument): Promise<{
        message: string;
    }>;
}
