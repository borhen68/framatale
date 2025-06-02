import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SupplierProductDocument = SupplierProduct & Document;

export enum SupplierType {
  PRINTFUL = 'PRINTFUL',
  PRINTIFY = 'PRINTIFY',
  GOOTEN = 'GOOTEN',
  PRODIGI = 'PRODIGI',
  CLOUD_PRINT = 'CLOUD_PRINT',
  RIP_PRINT = 'RIP_PRINT',
}

@Schema({ timestamps: true })
export class SupplierProduct {
  @ApiProperty({ enum: SupplierType, description: 'Supplier name' })
  @Prop({ required: true, enum: SupplierType, index: true })
  supplier: SupplierType;

  @ApiProperty({ description: 'Supplier product ID' })
  @Prop({ required: true, index: true })
  supplierProductId: string;

  @ApiProperty({ description: 'Product type (photo_book, canvas_print, etc.)' })
  @Prop({ required: true, index: true })
  productType: string;

  @ApiProperty({ description: 'Product variant (size, material, etc.)' })
  @Prop({ required: true })
  variant: string;

  @ApiProperty({ description: 'Product title' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Product description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Supplier wholesale price' })
  @Prop({ required: true })
  supplierPrice: number; // e.g., $4.00 from supplier

  @ApiProperty({ description: 'Your selling price' })
  @Prop({ required: true })
  sellingPrice: number; // e.g., $22.00 your price

  @ApiProperty({ description: 'Markup amount' })
  @Prop({ required: true })
  markup: number; // e.g., $18.00 ($22 - $4)

  @ApiProperty({ description: 'Markup percentage' })
  @Prop({ required: true })
  markupPercentage: number; // e.g., 450% (18/4 * 100)

  @ApiProperty({ description: 'Profit margin percentage' })
  @Prop({ required: true })
  marginPercentage: number; // e.g., 81.8% (18/22 * 100)

  @ApiProperty({ description: 'Product specifications' })
  @Prop({
    type: {
      width: Number,
      height: Number,
      unit: String, // inches, cm
      material: String,
      printMethod: String,
      weight: Number,
      pages: Number, // for books
    },
  })
  specifications: {
    width: number;
    height: number;
    unit: string;
    material: string;
    printMethod: string;
    weight?: number;
    pages?: number;
  };

  @ApiProperty({ description: 'Shipping information' })
  @Prop({
    type: {
      shippingCost: Number,
      processingTime: Number, // days
      shippingTime: Number,   // days
      totalTime: Number,      // processing + shipping
      regions: [String],      // supported regions
    },
  })
  shipping: {
    shippingCost: number;
    processingTime: number;
    shippingTime: number;
    totalTime: number;
    regions: string[];
  };

  @ApiProperty({ description: 'Volume pricing tiers' })
  @Prop({
    type: [{
      minQuantity: Number,
      maxQuantity: Number,
      supplierPrice: Number,
      sellingPrice: Number,
      markup: Number,
    }],
  })
  volumePricing?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    supplierPrice: number;
    sellingPrice: number;
    markup: number;
  }>;

  @ApiProperty({ description: 'Supplier API information' })
  @Prop({
    type: {
      apiEndpoint: String,
      lastSynced: Date,
      syncStatus: String,
      apiVersion: String,
    },
  })
  apiInfo: {
    apiEndpoint: string;
    lastSynced: Date;
    syncStatus: 'active' | 'inactive' | 'error';
    apiVersion: string;
  };

  @ApiProperty({ description: 'Product availability' })
  @Prop({ default: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Whether product is active in your store' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Product metadata' })
  @Prop({
    type: {
      category: String,
      tags: [String],
      popularity: Number,
      lastOrdered: Date,
      totalOrders: Number,
      revenue: Number,
    },
  })
  metadata: {
    category: string;
    tags: string[];
    popularity: number;
    lastOrdered?: Date;
    totalOrders: number;
    revenue: number;
  };
}

export const SupplierProductSchema = SchemaFactory.createForClass(SupplierProduct);

// Create indexes for efficient queries
SupplierProductSchema.index({ supplier: 1, productType: 1, isActive: 1 });
SupplierProductSchema.index({ supplierProductId: 1, supplier: 1 });
SupplierProductSchema.index({ productType: 1, variant: 1, isActive: 1 });
SupplierProductSchema.index({ sellingPrice: 1, isActive: 1 });
SupplierProductSchema.index({ markupPercentage: 1, isActive: 1 });
