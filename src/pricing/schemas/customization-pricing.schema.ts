import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CustomizationPricingDocument = CustomizationPricing & Document;

export enum CustomizationType {
  EXTRA_PAGES = 'EXTRA_PAGES',
  COVER_UPGRADE = 'COVER_UPGRADE',
  PAPER_UPGRADE = 'PAPER_UPGRADE',
  SIZE_UPGRADE = 'SIZE_UPGRADE',
  BINDING_UPGRADE = 'BINDING_UPGRADE',
  LAMINATION = 'LAMINATION',
  FOIL_STAMPING = 'FOIL_STAMPING',
  EMBOSSING = 'EMBOSSING',
  DUST_JACKET = 'DUST_JACKET',
  GIFT_BOX = 'GIFT_BOX',
}

export enum PricingModel {
  PER_UNIT = 'PER_UNIT',           // $1 per extra page
  FLAT_FEE = 'FLAT_FEE',           // $5 flat fee for upgrade
  PERCENTAGE = 'PERCENTAGE',        // 10% of base price
  TIERED = 'TIERED',               // Different prices for different quantities
}

@Schema({ timestamps: true })
export class CustomizationPricing {
  @ApiProperty({ description: 'Product type this applies to' })
  @Prop({ required: true, index: true })
  productType: string;

  @ApiProperty({ description: 'Product variant (optional)' })
  @Prop({ index: true })
  variant?: string;

  @ApiProperty({ enum: CustomizationType, description: 'Type of customization' })
  @Prop({ required: true, enum: CustomizationType, index: true })
  customizationType: CustomizationType;

  @ApiProperty({ description: 'Customization name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Customization description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: PricingModel, description: 'How this customization is priced' })
  @Prop({ required: true, enum: PricingModel })
  pricingModel: PricingModel;

  @ApiProperty({ description: 'Supplier cost for this customization' })
  @Prop({ required: true })
  supplierCost: number;

  @ApiProperty({ description: 'Your markup on this customization' })
  @Prop({ required: true })
  markup: number;

  @ApiProperty({ description: 'Customer price for this customization' })
  @Prop({ required: true })
  customerPrice: number;

  @ApiProperty({ description: 'Tiered pricing for different quantities' })
  @Prop({
    type: [{
      minQuantity: Number,
      maxQuantity: Number,
      supplierCost: Number,
      customerPrice: Number,
      markup: Number,
    }],
  })
  tiers?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    supplierCost: number;
    customerPrice: number;
    markup: number;
  }>;

  @ApiProperty({ description: 'Minimum and maximum allowed quantities' })
  @Prop({
    type: {
      min: Number,
      max: Number,
      default: Number,
    },
  })
  limits?: {
    min: number;
    max: number;
    default: number;
  };

  @ApiProperty({ description: 'Dependencies on other customizations' })
  @Prop({
    type: {
      requires: [String],        // Must have these customizations
      excludes: [String],        // Cannot have these customizations
      implies: [String],         // Automatically adds these customizations
    },
  })
  dependencies?: {
    requires: string[];
    excludes: string[];
    implies: string[];
  };

  @ApiProperty({ description: 'Supplier-specific information' })
  @Prop({
    type: {
      supplierId: String,
      supplierSku: String,
      processingTime: Number,    // Extra days for this customization
      availability: [String],    // Regions where available
    },
  })
  supplierInfo?: {
    supplierId: string;
    supplierSku: string;
    processingTime: number;
    availability: string[];
  };

  @ApiProperty({ description: 'Whether customization is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Display information for the editor' })
  @Prop({
    type: {
      displayName: String,
      icon: String,
      category: String,
      sortOrder: Number,
      tooltip: String,
      previewImage: String,
    },
  })
  display?: {
    displayName: string;
    icon: string;
    category: string;
    sortOrder: number;
    tooltip: string;
    previewImage: string;
  };

  @ApiProperty({ description: 'Metadata' })
  @Prop({
    type: {
      tags: [String],
      popularity: Number,
      lastUsed: Date,
      totalUsage: Number,
    },
  })
  metadata?: {
    tags: string[];
    popularity: number;
    lastUsed: Date;
    totalUsage: number;
  };
}

export const CustomizationPricingSchema = SchemaFactory.createForClass(CustomizationPricing);

// Create indexes for efficient queries
CustomizationPricingSchema.index({ productType: 1, customizationType: 1, isActive: 1 });
CustomizationPricingSchema.index({ variant: 1, customizationType: 1, isActive: 1 });
CustomizationPricingSchema.index({ 'display.category': 1, 'display.sortOrder': 1 });
