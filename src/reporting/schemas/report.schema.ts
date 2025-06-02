import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ReportDocument = Report & Document;

export enum ReportType {
  SALES = 'SALES',
  USER_ENGAGEMENT = 'USER_ENGAGEMENT',
  PRODUCT_PERFORMANCE = 'PRODUCT_PERFORMANCE',
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

export enum ReportFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

@Schema({ timestamps: true })
export class Report {
  @ApiProperty({ description: 'Report name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Report description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: ReportType, description: 'Type of report' })
  @Prop({ required: true, enum: ReportType })
  type: ReportType;

  @ApiProperty({ enum: ReportStatus, description: 'Report generation status' })
  @Prop({ required: true, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @ApiProperty({ enum: ReportFormat, description: 'Output format' })
  @Prop({ required: true, enum: ReportFormat })
  format: ReportFormat;

  @ApiProperty({ description: 'User who created the report' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Report parameters and filters' })
  @Prop({
    type: {
      startDate: Date,
      endDate: Date,
      filters: Object,
      groupBy: [String],
      metrics: [String],
      dimensions: [String],
    },
  })
  parameters: {
    startDate: Date;
    endDate: Date;
    filters?: Record<string, any>;
    groupBy?: string[];
    metrics?: string[];
    dimensions?: string[];
  };

  @ApiProperty({ description: 'Generated report data' })
  @Prop({ type: Object })
  data?: Record<string, any>;

  @ApiProperty({ description: 'Report file path (if saved to disk)' })
  @Prop()
  filePath?: string;

  @ApiProperty({ description: 'Report file size in bytes' })
  @Prop()
  fileSize?: number;

  @ApiProperty({ description: 'Download URL' })
  @Prop()
  downloadUrl?: string;

  @ApiProperty({ description: 'Report generation start time' })
  @Prop()
  startedAt?: Date;

  @ApiProperty({ description: 'Report generation completion time' })
  @Prop()
  completedAt?: Date;

  @ApiProperty({ description: 'Error message if generation failed' })
  @Prop()
  errorMessage?: string;

  @ApiProperty({ description: 'Scheduled report settings' })
  @Prop({
    type: {
      frequency: { type: String, enum: ReportFrequency },
      nextRunAt: Date,
      lastRunAt: Date,
      isActive: { type: Boolean, default: true },
      recipients: [String],
    },
  })
  schedule?: {
    frequency: ReportFrequency;
    nextRunAt: Date;
    lastRunAt?: Date;
    isActive: boolean;
    recipients: string[];
  };

  @ApiProperty({ description: 'Report metadata' })
  @Prop({
    type: {
      rowCount: Number,
      columnCount: Number,
      generationTime: Number,
      dataSource: String,
      version: String,
    },
  })
  metadata?: {
    rowCount?: number;
    columnCount?: number;
    generationTime?: number;
    dataSource?: string;
    version?: string;
  };

  @ApiProperty({ description: 'Report expiration date' })
  @Prop()
  expiresAt?: Date;

  @ApiProperty({ description: 'Whether report is shared' })
  @Prop({ default: false })
  isShared: boolean;

  @ApiProperty({ description: 'Share token for public access' })
  @Prop()
  shareToken?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
