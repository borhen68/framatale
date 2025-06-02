import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MediaDocument = Media & Document;

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

export enum MediaStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR',
}

@Schema({ timestamps: true })
export class Media {
  @ApiProperty({ description: 'Original filename' })
  @Prop({ required: true })
  originalName: string;

  @ApiProperty({ description: 'Stored filename' })
  @Prop({ required: true })
  filename: string;

  @ApiProperty({ description: 'File path or URL' })
  @Prop({ required: true })
  path: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Prop({ required: true })
  size: number;

  @ApiProperty({ description: 'MIME type' })
  @Prop({ required: true })
  mimeType: string;

  @ApiProperty({ enum: MediaType, description: 'Type of media' })
  @Prop({ required: true, enum: MediaType })
  type: MediaType;

  @ApiProperty({ enum: MediaStatus, description: 'Processing status' })
  @Prop({ required: true, enum: MediaStatus, default: MediaStatus.UPLOADING })
  status: MediaStatus;

  @ApiProperty({ description: 'User who uploaded the file' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Image dimensions' })
  @Prop({
    type: {
      width: Number,
      height: Number,
    },
  })
  dimensions?: {
    width: number;
    height: number;
  };

  @ApiProperty({ description: 'Thumbnail path' })
  @Prop()
  thumbnailPath?: string;

  @ApiProperty({ description: 'File metadata' })
  @Prop({
    type: {
      exif: Object,
      colorProfile: String,
      compression: String,
    },
  })
  metadata?: {
    exif?: any;
    colorProfile?: string;
    compression?: string;
  };

  @ApiProperty({ description: 'Tags for organization' })
  @Prop({ type: [String] })
  tags?: string[];

  @ApiProperty({ description: 'Alt text for accessibility' })
  @Prop()
  altText?: string;

  @ApiProperty({ description: 'Whether file is public' })
  @Prop({ default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'Download count' })
  @Prop({ default: 0 })
  downloadCount: number;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
