import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '../../common/schemas/product-size.schema';

export type LayoutTemplateDocument = LayoutTemplate & Document;

export interface ImageSlot {
  id: string;
  x: number; // Position as percentage of page width
  y: number; // Position as percentage of page height
  width: number; // Width as percentage of page width
  height: number; // Height as percentage of page height
  aspectRatio?: number; // Preferred aspect ratio
  minAspectRatio?: number;
  maxAspectRatio?: number;
  rotation?: number; // Rotation in degrees
  zIndex: number;
  required: boolean;
  cropMode: 'fit' | 'fill' | 'stretch';
  borderRadius?: number;
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

export interface TextSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  defaultText?: string;
  fontFamily: string;
  fontSize: number; // As percentage of slot height
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  maxLines?: number;
  overflow: 'hidden' | 'ellipsis' | 'wrap';
  zIndex: number;
}

export interface BackgroundElement {
  type: 'color' | 'gradient' | 'pattern' | 'image';
  value: string; // Color hex, gradient CSS, pattern name, or image URL
  opacity?: number;
  blendMode?: string;
}

@Schema({ timestamps: true })
export class LayoutTemplate {
  @ApiProperty({ description: 'Template name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Template description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: ProductType, description: 'Product type this template is for' })
  @Prop({ required: true, enum: ProductType })
  productType: ProductType;

  @ApiProperty({ description: 'Template category' })
  @Prop({ required: true })
  category: string;

  @ApiProperty({ description: 'Template tags for filtering' })
  @Prop({ type: [String] })
  tags: string[];

  @ApiProperty({ description: 'Number of image slots' })
  @Prop({ required: true })
  imageCount: number;

  @ApiProperty({ description: 'Preferred orientation for images' })
  @Prop({ enum: ['portrait', 'landscape', 'square', 'mixed'] })
  preferredOrientation: 'portrait' | 'landscape' | 'square' | 'mixed';

  @ApiProperty({ description: 'Image slots configuration' })
  @Prop({ type: [Object], required: true })
  imageSlots: ImageSlot[];

  @ApiProperty({ description: 'Text slots configuration' })
  @Prop({ type: [Object] })
  textSlots: TextSlot[];

  @ApiProperty({ description: 'Background configuration' })
  @Prop({ type: Object })
  background?: BackgroundElement;

  @ApiProperty({ description: 'Template preview image URL' })
  @Prop()
  previewUrl?: string;

  @ApiProperty({ description: 'Template thumbnail URL' })
  @Prop()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Whether template is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Whether template is premium' })
  @Prop({ default: false })
  isPremium: boolean;

  @ApiProperty({ description: 'Template difficulty level' })
  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({ description: 'Usage count for analytics' })
  @Prop({ default: 0 })
  usageCount: number;

  @ApiProperty({ description: 'Average rating' })
  @Prop({ min: 0, max: 5 })
  averageRating?: number;

  @ApiProperty({ description: 'Template metadata' })
  @Prop({
    type: {
      createdBy: String,
      version: { type: String, default: '1.0' },
      compatibleSizes: [String],
      estimatedTime: Number, // in minutes
    },
  })
  metadata?: {
    createdBy?: string;
    version: string;
    compatibleSizes: string[];
    estimatedTime?: number;
  };
}

export const LayoutTemplateSchema = SchemaFactory.createForClass(LayoutTemplate);
