import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType, CanvasType } from './canvas.schema';

export type TemplateDocument = Template & Document;

export enum TemplateCategory {
  WEDDING = 'WEDDING',
  BIRTHDAY = 'BIRTHDAY',
  BABY = 'BABY',
  TRAVEL = 'TRAVEL',
  FAMILY = 'FAMILY',
  BUSINESS = 'BUSINESS',
  HOLIDAY = 'HOLIDAY',
  GRADUATION = 'GRADUATION',
  ANNIVERSARY = 'ANNIVERSARY',
  MINIMALIST = 'MINIMALIST',
  VINTAGE = 'VINTAGE',
  MODERN = 'MODERN',
  ELEGANT = 'ELEGANT',
  CREATIVE = 'CREATIVE',
  SEASONAL = 'SEASONAL',
}

export enum TemplateStyle {
  CLASSIC = 'CLASSIC',
  MODERN = 'MODERN',
  MINIMALIST = 'MINIMALIST',
  VINTAGE = 'VINTAGE',
  ELEGANT = 'ELEGANT',
  PLAYFUL = 'PLAYFUL',
  PROFESSIONAL = 'PROFESSIONAL',
  ARTISTIC = 'ARTISTIC',
}

@Schema({ timestamps: true })
export class Template {
  @ApiProperty({ description: 'Template ID' })
  _id: Types.ObjectId;

  @ApiProperty({ description: 'Template name' })
  @Prop({ required: true, index: true })
  name: string;

  @ApiProperty({ description: 'Template description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: ProductType, description: 'Product type this template is for' })
  @Prop({ required: true, enum: ProductType, index: true })
  productType: ProductType;

  @ApiProperty({ enum: CanvasType, description: 'Canvas type (for single canvas templates)' })
  @Prop({ enum: CanvasType })
  canvasType?: CanvasType;

  @ApiProperty({ enum: TemplateCategory, description: 'Template category' })
  @Prop({ required: true, enum: TemplateCategory, index: true })
  category: TemplateCategory;

  @ApiProperty({ enum: TemplateStyle, description: 'Template style' })
  @Prop({ required: true, enum: TemplateStyle, index: true })
  style: TemplateStyle;

  @ApiProperty({ description: 'Template dimensions and specifications' })
  @Prop({
    type: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, default: 'px' },
      dpi: { type: Number, default: 300 },
      orientation: { type: String, enum: ['portrait', 'landscape'], required: true },
      pageCount: { type: Number, default: 1 },      // For multi-page templates
      spreadCount: { type: Number, default: 0 },    // For photo books
    },
    required: true,
  })
  dimensions: {
    width: number;
    height: number;
    unit: string;
    dpi: number;
    orientation: 'portrait' | 'landscape';
    pageCount: number;
    spreadCount: number;
  };

  @ApiProperty({ description: 'Template canvas data' })
  @Prop({
    type: [{
      canvasType: { type: String, enum: Object.values(CanvasType), required: true },
      name: { type: String, required: true },
      order: { type: Number, required: true },
      
      // Canvas structure (same as Canvas schema but embedded)
      dimensions: {
        width: Number,
        height: Number,
        unit: String,
        dpi: Number,
        bleed: Number,
        safeZone: Number,
        orientation: String,
      },
      
      background: {
        type: String,
        color: String,
        image: {
          url: String,
          opacity: Number,
          position: String,
          size: String,
        },
        gradient: {
          type: String,
          colors: [String],
          direction: String,
        },
      },
      
      elements: [{
        id: String,
        type: String,
        name: String,
        position: { x: Number, y: Number, z: Number },
        size: { width: Number, height: Number },
        rotation: Number,
        opacity: Number,
        visible: Boolean,
        locked: Boolean,
        
        // Placeholder for user content
        isPlaceholder: { type: Boolean, default: false },
        placeholderType: { type: String, enum: ['image', 'text'] },
        placeholderText: String,
        
        image: {
          url: String,
          originalUrl: String,
          crop: { x: Number, y: Number, width: Number, height: Number },
          filters: {
            brightness: Number,
            contrast: Number,
            saturation: Number,
            blur: Number,
            sepia: Number,
          },
        },
        
        text: {
          content: String,
          fontFamily: String,
          fontSize: Number,
          fontWeight: String,
          fontStyle: String,
          color: String,
          align: String,
          lineHeight: Number,
          letterSpacing: Number,
          textDecoration: String,
        },
        
        shape: {
          type: String,
          fill: String,
          stroke: {
            color: String,
            width: Number,
            style: String,
          },
          cornerRadius: Number,
        },
      }],
    }],
    required: true,
  })
  canvases: Array<{
    canvasType: CanvasType;
    name: string;
    order: number;
    dimensions: {
      width: number;
      height: number;
      unit: string;
      dpi: number;
      bleed: number;
      safeZone: number;
      orientation: string;
    };
    background?: any;
    elements: Array<{
      id: string;
      type: string;
      name: string;
      position: { x: number; y: number; z: number };
      size: { width: number; height: number };
      rotation: number;
      opacity: number;
      visible: boolean;
      locked: boolean;
      isPlaceholder?: boolean;
      placeholderType?: 'image' | 'text';
      placeholderText?: string;
      image?: any;
      text?: any;
      shape?: any;
    }>;
  }>;

  @ApiProperty({ description: 'Template preview images' })
  @Prop({
    type: {
      thumbnail: { type: String, required: true },    // Small preview
      preview: { type: String, required: true },      // Medium preview
      fullPreview: String,                            // Large preview
      mockup: String,                                 // 3D mockup image
      gallery: [String],                              // Multiple preview images
    },
    required: true,
  })
  previews: {
    thumbnail: string;
    preview: string;
    fullPreview?: string;
    mockup?: string;
    gallery?: string[];
  };

  @ApiProperty({ description: 'Template pricing and availability' })
  @Prop({
    type: {
      isPremium: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      isPublic: { type: Boolean, default: true },
      requiredSubscription: String,                   // 'free', 'pro', 'premium'
    },
  })
  pricing: {
    isPremium: boolean;
    price: number;
    isActive: boolean;
    isPublic: boolean;
    requiredSubscription?: string;
  };

  @ApiProperty({ description: 'Template metadata and analytics' })
  @Prop({
    type: {
      tags: [String],
      colors: [String],                               // Dominant colors in template
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
      estimatedTime: Number,                          // Minutes to complete
      usageCount: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      featured: { type: Boolean, default: false },
      trending: { type: Boolean, default: false },
      seasonal: { type: Boolean, default: false },
      createdBy: { type: Types.ObjectId, ref: 'User' },
      designerName: String,
      designerCredit: String,
      license: { type: String, default: 'standard' },
      version: { type: Number, default: 1 },
    },
  })
  metadata: {
    tags: string[];
    colors: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime?: number;
    usageCount: number;
    rating: number;
    ratingCount: number;
    featured: boolean;
    trending: boolean;
    seasonal: boolean;
    createdBy?: Types.ObjectId;
    designerName?: string;
    designerCredit?: string;
    license: string;
    version: number;
  };

  @ApiProperty({ description: 'Adobe InDesign source information' })
  @Prop({
    type: {
      indesignFile: String,                           // Path to .indd file
      indesignVersion: String,                        // InDesign version used
      exportSettings: {
        format: { type: String, default: 'pdf' },
        quality: { type: String, default: 'high' },
        colorSpace: { type: String, default: 'cmyk' },
        resolution: { type: Number, default: 300 },
      },
      fonts: [String],                                // Required fonts
      linkedAssets: [String],                         // Linked images/assets
      lastExported: Date,
    },
  })
  indesign?: {
    indesignFile: string;
    indesignVersion: string;
    exportSettings: {
      format: string;
      quality: string;
      colorSpace: string;
      resolution: number;
    };
    fonts: string[];
    linkedAssets: string[];
    lastExported?: Date;
  };

  @ApiProperty({ description: 'Template creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Template last update date' })
  updatedAt: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);

// Create indexes for efficient template queries
TemplateSchema.index({ productType: 1, category: 1, 'pricing.isActive': 1 });
TemplateSchema.index({ style: 1, 'pricing.isActive': 1 });
TemplateSchema.index({ 'metadata.featured': 1, 'pricing.isActive': 1 });
TemplateSchema.index({ 'metadata.trending': 1, 'pricing.isActive': 1 });
TemplateSchema.index({ 'metadata.usageCount': -1, 'pricing.isActive': 1 });
TemplateSchema.index({ 'metadata.rating': -1, 'pricing.isActive': 1 });
TemplateSchema.index({ 'dimensions.orientation': 1, productType: 1 });
TemplateSchema.index({ 'metadata.tags': 1, 'pricing.isActive': 1 });
