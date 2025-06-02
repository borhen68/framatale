import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AnalyticsEventDocument = AnalyticsEvent & Document;

export enum EventType {
  // User Events
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  
  // Project Events
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_VIEWED = 'PROJECT_VIEWED',
  PROJECT_EDITED = 'PROJECT_EDITED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  PROJECT_SHARED = 'PROJECT_SHARED',
  
  // Media Events
  IMAGE_UPLOADED = 'IMAGE_UPLOADED',
  IMAGE_DOWNLOADED = 'IMAGE_DOWNLOADED',
  IMAGE_ENHANCED = 'IMAGE_ENHANCED',
  
  // Template Events
  TEMPLATE_VIEWED = 'TEMPLATE_VIEWED',
  TEMPLATE_APPLIED = 'TEMPLATE_APPLIED',
  TEMPLATE_RATED = 'TEMPLATE_RATED',
  
  // Export Events
  EXPORT_STARTED = 'EXPORT_STARTED',
  EXPORT_COMPLETED = 'EXPORT_COMPLETED',
  EXPORT_DOWNLOADED = 'EXPORT_DOWNLOADED',
  
  // Order Events
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_PAID = 'ORDER_PAID',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  
  // Engagement Events
  PAGE_VIEW = 'PAGE_VIEW',
  FEATURE_USED = 'FEATURE_USED',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  SEARCH_PERFORMED = 'SEARCH_PERFORMED',
}

export enum EventCategory {
  USER = 'USER',
  PROJECT = 'PROJECT',
  MEDIA = 'MEDIA',
  TEMPLATE = 'TEMPLATE',
  EXPORT = 'EXPORT',
  ORDER = 'ORDER',
  ENGAGEMENT = 'ENGAGEMENT',
  SYSTEM = 'SYSTEM',
}

@Schema({ timestamps: true })
export class AnalyticsEvent {
  @ApiProperty({ enum: EventType, description: 'Type of event' })
  @Prop({ required: true, enum: EventType, index: true })
  eventType: EventType;

  @ApiProperty({ enum: EventCategory, description: 'Event category' })
  @Prop({ required: true, enum: EventCategory, index: true })
  category: EventCategory;

  @ApiProperty({ description: 'User ID (if applicable)' })
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @ApiProperty({ description: 'Session ID' })
  @Prop({ index: true })
  sessionId?: string;

  @ApiProperty({ description: 'Event properties' })
  @Prop({ type: Object })
  properties?: Record<string, any>;

  @ApiProperty({ description: 'User agent string' })
  @Prop()
  userAgent?: string;

  @ApiProperty({ description: 'IP address' })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: 'Referrer URL' })
  @Prop()
  referrer?: string;

  @ApiProperty({ description: 'Page URL' })
  @Prop()
  url?: string;

  @ApiProperty({ description: 'Device information' })
  @Prop({
    type: {
      type: String,
      os: String,
      browser: String,
      isMobile: Boolean,
      screenResolution: String,
    },
  })
  device?: {
    type: string;
    os: string;
    browser: string;
    isMobile: boolean;
    screenResolution: string;
  };

  @ApiProperty({ description: 'Geographic location' })
  @Prop({
    type: {
      country: String,
      region: String,
      city: String,
      timezone: String,
    },
  })
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };

  @ApiProperty({ description: 'Event value (for revenue tracking)' })
  @Prop()
  value?: number;

  @ApiProperty({ description: 'Currency code' })
  @Prop()
  currency?: string;

  @ApiProperty({ description: 'A/B test variant' })
  @Prop()
  abTestVariant?: string;

  @ApiProperty({ description: 'Event timestamp' })
  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);

// Create compound indexes for common queries
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ category: 1, timestamp: -1 });
AnalyticsEventSchema.index({ timestamp: -1 }); // For time-based queries
