import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductCostDocument = ProductCost & Document;

export enum CostType {
  SUPPLIER_COST = 'SUPPLIER_COST',
  MANUFACTURING_COST = 'MANUFACTURING_COST',
  SHIPPING_COST = 'SHIPPING_COST',
  HANDLING_COST = 'HANDLING_COST',
  OVERHEAD_COST = 'OVERHEAD_COST',
}

@Schema({ timestamps: true })
export class ProductCost {
  @ApiProperty({ description: 'Product type (e.g., photo_book, canvas_print)' })
  @Prop({ required: true, index: true })
  productType: string;

  @ApiProperty({ description: 'Product variant (size, quality, etc.)' })
  @Prop({ index: true })
  variant?: string;

  @ApiProperty({ description: 'Supplier information' })
  @Prop({
    type: {
      supplierId: String,
      supplierName: String,
      supplierSku: String,
      minimumOrderQuantity: Number,
      leadTime: Number, // days
      qualityRating: Number, // 1-5
    },
  })
  supplier: {
    supplierId: string;
    supplierName: string;
    supplierSku: string;
    minimumOrderQuantity: number;
    leadTime: number;
    qualityRating: number;
  };

  @ApiProperty({ description: 'Cost breakdown' })
  @Prop({
    type: {
      baseCost: Number,
      shippingCost: Number,
      handlingFee: Number,
      qualityControlCost: Number,
      packagingCost: Number,
      totalCost: Number,
    },
    required: true,
  })
  costs: {
    baseCost: number;        // $4.00 for your photo book
    shippingCost: number;    // Cost to ship from supplier
    handlingFee: number;     // Your handling cost
    qualityControlCost: number; // QC cost
    packagingCost: number;   // Packaging cost
    totalCost: number;       // Total cost of goods sold (COGS)
  };

  @ApiProperty({ description: 'Volume-based pricing tiers' })
  @Prop({
    type: [{
      minQuantity: Number,
      maxQuantity: Number,
      unitCost: Number,
      discount: Number,
    }],
  })
  volumeTiers?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    unitCost: number;
    discount: number;
  }>;

  @ApiProperty({ description: 'Target pricing strategy' })
  @Prop({
    type: {
      targetSellingPrice: Number,  // $22.00 for your photo book
      targetMargin: Number,        // Desired margin %
      minimumMargin: Number,       // Minimum acceptable margin %
      competitorPrice: Number,     // Market research price
      recommendedPrice: Number,    // AI-recommended price
    },
  })
  pricing: {
    targetSellingPrice: number;
    targetMargin: number;
    minimumMargin: number;
    competitorPrice?: number;
    recommendedPrice?: number;
  };

  @ApiProperty({ description: 'Geographic cost variations' })
  @Prop({
    type: {
      region: String,
      localCosts: {
        shipping: Number,
        taxes: Number,
        duties: Number,
        handling: Number,
      },
    },
  })
  geographic?: Array<{
    region: string;
    localCosts: {
      shipping: number;
      taxes: number;
      duties: number;
      handling: number;
    };
  }>;

  @ApiProperty({ description: 'Cost validity period' })
  @Prop()
  validFrom: Date;

  @ApiProperty({ description: 'Cost expiration date' })
  @Prop()
  validUntil?: Date;

  @ApiProperty({ description: 'Whether cost is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Cost metadata' })
  @Prop({
    type: {
      currency: String,
      lastUpdated: Date,
      updatedBy: String,
      notes: String,
      contractReference: String,
    },
  })
  metadata: {
    currency: string;
    lastUpdated: Date;
    updatedBy: string;
    notes?: string;
    contractReference?: string;
  };
}

export const ProductCostSchema = SchemaFactory.createForClass(ProductCost);

// Create indexes for efficient cost queries
ProductCostSchema.index({ productType: 1, variant: 1, isActive: 1 });
ProductCostSchema.index({ 'supplier.supplierId': 1, isActive: 1 });
ProductCostSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });
