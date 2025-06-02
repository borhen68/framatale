import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ExportJobDocument = ExportJob & Document;

export enum ExportFormat {
  PDF_PRINT = 'PDF_PRINT',
  PDF_WEB = 'PDF_WEB',
  JPEG_HIGH = 'JPEG_HIGH',
  JPEG_WEB = 'JPEG_WEB',
  PNG = 'PNG',
}

export enum ExportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class ExportJob {
  @ApiProperty({ description: 'Reference to project' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @ApiProperty({ description: 'User who requested the export' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ enum: ExportFormat, description: 'Export format' })
  @Prop({ required: true, enum: ExportFormat })
  format: ExportFormat;

  @ApiProperty({ enum: ExportStatus, description: 'Export status' })
  @Prop({ required: true, enum: ExportStatus, default: ExportStatus.PENDING })
  status: ExportStatus;

  @ApiProperty({ description: 'Export settings' })
  @Prop({
    type: {
      dpi: Number,
      quality: Number,
      colorProfile: String,
      bleed: Boolean,
      cropMarks: Boolean,
      includeMetadata: Boolean,
      pageRange: String,
    },
  })
  settings?: {
    dpi?: number;
    quality?: number;
    colorProfile?: string;
    bleed?: boolean;
    cropMarks?: boolean;
    includeMetadata?: boolean;
    pageRange?: string;
  };

  @ApiProperty({ description: 'Export progress (0-100)' })
  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @ApiProperty({ description: 'Generated file path' })
  @Prop()
  filePath?: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Prop()
  fileSize?: number;

  @ApiProperty({ description: 'Download URL' })
  @Prop()
  downloadUrl?: string;

  @ApiProperty({ description: 'Error message if export failed' })
  @Prop()
  errorMessage?: string;

  @ApiProperty({ description: 'Processing start time' })
  @Prop()
  startedAt?: Date;

  @ApiProperty({ description: 'Processing completion time' })
  @Prop()
  completedAt?: Date;

  @ApiProperty({ description: 'File expiration time' })
  @Prop()
  expiresAt?: Date;

  @ApiProperty({ description: 'Number of pages exported' })
  @Prop()
  pageCount?: number;

  @ApiProperty({ description: 'Export metadata' })
  @Prop({
    type: {
      processingTime: Number,
      totalImages: Number,
      resolution: String,
      colorSpace: String,
      compression: String,
    },
  })
  metadata?: {
    processingTime?: number;
    totalImages?: number;
    resolution?: string;
    colorSpace?: string;
    compression?: string;
  };
}

export const ExportJobSchema = SchemaFactory.createForClass(ExportJob);
