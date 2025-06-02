import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  EXPORT_READY = 'EXPORT_READY',
  ENHANCEMENT_COMPLETE = 'ENHANCEMENT_COMPLETE',
  PROJECT_SHARED = 'PROJECT_SHARED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  PROMOTIONAL = 'PROMOTIONAL',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({ description: 'Recipient user ID' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ enum: NotificationType, description: 'Type of notification' })
  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: NotificationChannel, description: 'Delivery channel' })
  @Prop({ required: true, enum: NotificationChannel })
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationStatus, description: 'Notification status' })
  @Prop({ required: true, enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @ApiProperty({ description: 'Notification title' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @Prop({ required: true })
  message: string;

  @ApiProperty({ description: 'Rich content data' })
  @Prop({
    type: {
      html: String,
      imageUrl: String,
      actionUrl: String,
      actionText: String,
      metadata: Object,
    },
  })
  content?: {
    html?: string;
    imageUrl?: string;
    actionUrl?: string;
    actionText?: string;
    metadata?: Record<string, any>;
  };

  @ApiProperty({ description: 'Related entity reference' })
  @Prop({
    type: {
      entityType: String,
      entityId: String,
    },
  })
  relatedEntity?: {
    entityType: 'order' | 'project' | 'export' | 'enhancement';
    entityId: string;
  };

  @ApiProperty({ description: 'Notification priority' })
  @Prop({ enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' })
  priority: 'low' | 'normal' | 'high' | 'urgent';

  @ApiProperty({ description: 'Scheduled send time' })
  @Prop()
  scheduledAt?: Date;

  @ApiProperty({ description: 'Actual send time' })
  @Prop()
  sentAt?: Date;

  @ApiProperty({ description: 'Delivery confirmation time' })
  @Prop()
  deliveredAt?: Date;

  @ApiProperty({ description: 'Read time' })
  @Prop()
  readAt?: Date;

  @ApiProperty({ description: 'Expiration time' })
  @Prop()
  expiresAt?: Date;

  @ApiProperty({ description: 'Error message if delivery failed' })
  @Prop()
  errorMessage?: string;

  @ApiProperty({ description: 'Number of retry attempts' })
  @Prop({ default: 0 })
  retryCount: number;

  @ApiProperty({ description: 'External service message ID' })
  @Prop()
  externalMessageId?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
