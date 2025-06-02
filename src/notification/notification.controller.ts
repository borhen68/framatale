import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Notification, NotificationChannel, NotificationStatus } from './schemas/notification.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'channel', enum: NotificationChannel, required: false })
  @ApiQuery({ name: 'status', enum: NotificationStatus, required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'unreadOnly', type: 'boolean', required: false })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @CurrentUser() user: UserDocument,
    @Query('channel') channel?: NotificationChannel,
    @Query('status') status?: NotificationStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('unreadOnly') unreadOnly?: boolean,
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    return this.notificationService.getUserNotifications((user._id as any).toString(), {
      channel,
      status,
      limit,
      offset,
      unreadOnly,
    });
  }

  @Put(':notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Notification> {
    return this.notificationService.markAsRead(notificationId, (user._id as any).toString());
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: UserDocument): Promise<{ count: number }> {
    const count = await this.notificationService.markAllAsRead((user._id as any).toString());
    return { count };
  }

  @Delete(':notificationId')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    await this.notificationService.deleteNotification(notificationId, (user._id as any).toString());
    return { message: 'Notification deleted successfully' };
  }
}
