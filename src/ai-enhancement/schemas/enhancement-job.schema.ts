import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type EnhancementJobDocument = EnhancementJob & Document;

export enum EnhancementType {
  UPSCALE = 'UPSCALE',
  BACKGROUND_REMOVAL = 'BACKGROUND_REMOVAL',
  NOISE_REDUCTION = 'NOISE_REDUCTION',
  COLOR_CORRECTION = 'COLOR_CORRECTION',
  SHARPENING = 'SHARPENING',
  STYLE_TRANSFER = 'STYLE_TRANSFER',
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class EnhancementJob {
  @ApiProperty({ description: 'Reference to original media file' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Media' })
  originalMediaId: Types.ObjectId;

  @ApiProperty({ description: 'Reference to enhanced media file' })
  @Prop({ type: Types.ObjectId, ref: 'Media' })
  enhancedMediaId?: Types.ObjectId;

  @ApiProperty({ description: 'User who requested the enhancement' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ enum: EnhancementType, description: 'Type of enhancement' })
  @Prop({ required: true, enum: EnhancementType })
  enhancementType: EnhancementType;

  @ApiProperty({ enum: JobStatus, description: 'Job status' })
  @Prop({ required: true, enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @ApiProperty({ description: 'Enhancement parameters' })
  @Prop({
    type: {
      scale: Number,
      quality: Number,
      preserveTransparency: Boolean,
      styleReference: String,
      customSettings: Object,
    },
  })
  parameters?: {
    scale?: number;
    quality?: number;
    preserveTransparency?: boolean;
    styleReference?: string;
    customSettings?: Record<string, any>;
  };

  @ApiProperty({ description: 'Processing progress (0-100)' })
  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @ApiProperty({ description: 'Error message if job failed' })
  @Prop()
  errorMessage?: string;

  @ApiProperty({ description: 'Processing start time' })
  @Prop()
  startedAt?: Date;

  @ApiProperty({ description: 'Processing completion time' })
  @Prop()
  completedAt?: Date;

  @ApiProperty({ description: 'Estimated processing time in seconds' })
  @Prop()
  estimatedDuration?: number;

  @ApiProperty({ description: 'External service job ID' })
  @Prop()
  externalJobId?: string;

  @ApiProperty({ description: 'Processing metadata' })
  @Prop({
    type: {
      originalSize: Number,
      enhancedSize: Number,
      processingTime: Number,
      serviceUsed: String,
      qualityScore: Number,
    },
  })
  metadata?: {
    originalSize?: number;
    enhancedSize?: number;
    processingTime?: number;
    serviceUsed?: string;
    qualityScore?: number;
  };
}

export const EnhancementJobSchema = SchemaFactory.createForClass(EnhancementJob);
