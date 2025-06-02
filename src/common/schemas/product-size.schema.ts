import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductSizeDocument = ProductSize & Document;

export enum ProductType {
  PHOTOBOOK = 'PHOTOBOOK',
  CALENDAR = 'CALENDAR',
  CARD = 'CARD',
}

@Schema({ timestamps: true })
export class ProductSize {
  @ApiProperty({ enum: ProductType, description: 'Type of product' })
  @Prop({ required: true, enum: ProductType })
  type: ProductType;

  @ApiProperty({ description: 'Size code (e.g., 8x8, A4, 5x7)' })
  @Prop({ required: true })
  sizeCode: string;

  @ApiProperty({ description: 'Width in millimeters' })
  @Prop({ required: true })
  widthMm: number;

  @ApiProperty({ description: 'Height in millimeters' })
  @Prop({ required: true })
  heightMm: number;

  @ApiProperty({ description: 'Aspect ratio' })
  @Prop({ required: true })
  aspectRatio: number;

  @ApiProperty({ description: 'Bleed area in millimeters' })
  @Prop({ required: true })
  bleedMm: number;

  @ApiProperty({ description: 'Safe zone in millimeters' })
  @Prop({ required: true })
  safeZoneMm: number;

  @ApiProperty({ description: 'Supplier ID' })
  @Prop({ required: true })
  supplierId: string;
}

export const ProductSizeSchema = SchemaFactory.createForClass(ProductSize);
