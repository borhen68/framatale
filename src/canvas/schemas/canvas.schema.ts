import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CanvasDocument = Canvas & Document;

export enum ProductType {
  PHOTO_BOOK = 'PHOTO_BOOK',
  GREETING_CARD = 'GREETING_CARD',
  BUSINESS_CARD = 'BUSINESS_CARD',
  CALENDAR = 'CALENDAR',
  POSTER = 'POSTER',
  FLYER = 'FLYER',
}

export enum CanvasType {
  COVER = 'COVER',           // Front/back cover
  PAGE = 'PAGE',             // Interior page
  SPREAD = 'SPREAD',         // Two-page spread
  SINGLE = 'SINGLE',         // Single-sided (cards, posters)
  MONTH = 'MONTH',           // Calendar month
}

export enum ElementType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  SHAPE = 'SHAPE',
  BACKGROUND = 'BACKGROUND',
  PLACEHOLDER = 'PLACEHOLDER',
}

@Schema({ timestamps: true })
export class Canvas {
  @ApiProperty({ description: 'Canvas ID' })
  _id: Types.ObjectId;

  @ApiProperty({ description: 'Project this canvas belongs to' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @ApiProperty({ enum: ProductType, description: 'Product type' })
  @Prop({ required: true, enum: ProductType, index: true })
  productType: ProductType;

  @ApiProperty({ enum: CanvasType, description: 'Canvas type' })
  @Prop({ required: true, enum: CanvasType })
  canvasType: CanvasType;

  @ApiProperty({ description: 'Canvas name/title' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Canvas order/position in project' })
  @Prop({ required: true, index: true })
  order: number;

  @ApiProperty({ description: 'Canvas dimensions and settings' })
  @Prop({
    type: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, default: 'px' },        // px, mm, in
      dpi: { type: Number, default: 300 },          // Print resolution
      bleed: { type: Number, default: 0 },          // Bleed area in mm
      safeZone: { type: Number, default: 5 },       // Safe zone in mm
      orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
    },
    required: true,
  })
  dimensions: {
    width: number;
    height: number;
    unit: string;
    dpi: number;
    bleed: number;
    safeZone: number;
    orientation: 'portrait' | 'landscape';
  };

  @ApiProperty({ description: 'Canvas background' })
  @Prop({
    type: {
      type: { type: String, enum: ['color', 'image', 'gradient'], default: 'color' },
      color: { type: String, default: '#ffffff' },
      image: {
        url: String,
        opacity: { type: Number, default: 1 },
        position: { type: String, default: 'center' },
        size: { type: String, default: 'cover' },
      },
      gradient: {
        type: { type: String, enum: ['linear', 'radial'], default: 'linear' },
        colors: [String],
        direction: { type: String, default: '0deg' },
      },
    },
  })
  background?: {
    type: 'color' | 'image' | 'gradient';
    color?: string;
    image?: {
      url: string;
      opacity: number;
      position: string;
      size: string;
    };
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction: string;
    };
  };

  @ApiProperty({ description: 'Canvas elements (images, text, shapes)' })
  @Prop({
    type: [{
      id: { type: String, required: true },
      type: { type: String, enum: Object.values(ElementType), required: true },
      name: { type: String, required: true },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, default: 0 },
      },
      size: {
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
      rotation: { type: Number, default: 0 },
      opacity: { type: Number, default: 1 },
      visible: { type: Boolean, default: true },
      locked: { type: Boolean, default: false },
      
      // Image-specific properties
      image: {
        url: String,
        originalUrl: String,
        crop: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
        filters: {
          brightness: { type: Number, default: 100 },
          contrast: { type: Number, default: 100 },
          saturation: { type: Number, default: 100 },
          blur: { type: Number, default: 0 },
          sepia: { type: Number, default: 0 },
        },
      },
      
      // Text-specific properties
      text: {
        content: String,
        fontFamily: { type: String, default: 'Arial' },
        fontSize: { type: Number, default: 16 },
        fontWeight: { type: String, default: 'normal' },
        fontStyle: { type: String, default: 'normal' },
        color: { type: String, default: '#000000' },
        align: { type: String, enum: ['left', 'center', 'right', 'justify'], default: 'left' },
        lineHeight: { type: Number, default: 1.2 },
        letterSpacing: { type: Number, default: 0 },
        textDecoration: { type: String, default: 'none' },
      },
      
      // Shape-specific properties
      shape: {
        type: { type: String, enum: ['rectangle', 'circle', 'triangle', 'polygon'] },
        fill: { type: String, default: '#000000' },
        stroke: {
          color: { type: String, default: '#000000' },
          width: { type: Number, default: 0 },
          style: { type: String, enum: ['solid', 'dashed', 'dotted'], default: 'solid' },
        },
        cornerRadius: { type: Number, default: 0 },
      },
    }],
    default: [],
  })
  elements: Array<{
    id: string;
    type: ElementType;
    name: string;
    position: { x: number; y: number; z: number };
    size: { width: number; height: number };
    rotation: number;
    opacity: number;
    visible: boolean;
    locked: boolean;
    image?: {
      url: string;
      originalUrl: string;
      crop?: { x: number; y: number; width: number; height: number };
      filters?: {
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
        sepia: number;
      };
    };
    text?: {
      content: string;
      fontFamily: string;
      fontSize: number;
      fontWeight: string;
      fontStyle: string;
      color: string;
      align: 'left' | 'center' | 'right' | 'justify';
      lineHeight: number;
      letterSpacing: number;
      textDecoration: string;
    };
    shape?: {
      type: 'rectangle' | 'circle' | 'triangle' | 'polygon';
      fill: string;
      stroke: {
        color: string;
        width: number;
        style: 'solid' | 'dashed' | 'dotted';
      };
      cornerRadius: number;
    };
  }>;

  @ApiProperty({ description: 'Template information if canvas is based on template' })
  @Prop({
    type: {
      templateId: { type: Types.ObjectId, ref: 'Template' },
      templateName: String,
      templateCategory: String,
      appliedAt: { type: Date, default: Date.now },
      customizations: [String], // Track what user changed from template
    },
  })
  template?: {
    templateId: Types.ObjectId;
    templateName: string;
    templateCategory: string;
    appliedAt: Date;
    customizations: string[];
  };

  @ApiProperty({ description: 'Canvas metadata' })
  @Prop({
    type: {
      isTemplate: { type: Boolean, default: false },
      tags: [String],
      notes: String,
      lastEditedBy: { type: Types.ObjectId, ref: 'User' },
      version: { type: Number, default: 1 },
      printReady: { type: Boolean, default: false },
      previewUrl: String,
      thumbnailUrl: String,
    },
  })
  metadata?: {
    isTemplate: boolean;
    tags: string[];
    notes: string;
    lastEditedBy: Types.ObjectId;
    version: number;
    printReady: boolean;
    previewUrl: string;
    thumbnailUrl: string;
  };

  @ApiProperty({ description: 'Canvas creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Canvas last update date' })
  updatedAt: Date;
}

export const CanvasSchema = SchemaFactory.createForClass(Canvas);

// Create indexes for efficient queries
CanvasSchema.index({ projectId: 1, order: 1 });
CanvasSchema.index({ productType: 1, canvasType: 1 });
CanvasSchema.index({ 'template.templateId': 1 });
CanvasSchema.index({ 'metadata.isTemplate': 1, productType: 1 });
