import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PricingRuleDocument = PricingRule & Document;

export enum PricingType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
  TIERED = 'TIERED',
  VOLUME = 'VOLUME',
  DYNAMIC = 'DYNAMIC',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum PricingScope {
  GLOBAL = 'GLOBAL',
  PRODUCT = 'PRODUCT',
  USER = 'USER',
  REGION = 'REGION',
  CHANNEL = 'CHANNEL',
}

export enum DiscountType {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  BULK_DISCOUNT = 'BULK_DISCOUNT',
  LOYALTY_DISCOUNT = 'LOYALTY_DISCOUNT',
}

@Schema({ timestamps: true })
export class PricingRule {
  @ApiProperty({ description: 'Rule name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Rule description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: PricingType, description: 'Type of pricing rule' })
  @Prop({ required: true, enum: PricingType })
  type: PricingType;

  @ApiProperty({ enum: PricingScope, description: 'Scope of pricing rule' })
  @Prop({ required: true, enum: PricingScope })
  scope: PricingScope;

  @ApiProperty({ description: 'Priority (higher number = higher priority)' })
  @Prop({ required: true, default: 1 })
  priority: number;

  @ApiProperty({ description: 'Whether rule is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Rule conditions' })
  @Prop({
    type: {
      productTypes: [String],
      userSegments: [String],
      regions: [String],
      channels: [String],
      minQuantity: Number,
      maxQuantity: Number,
      minOrderValue: Number,
      maxOrderValue: Number,
      customerTier: String,
      timeRange: {
        start: Date,
        end: Date,
      },
      dayOfWeek: [Number],
      seasonality: String,
    },
  })
  conditions?: {
    productTypes?: string[];
    userSegments?: string[];
    regions?: string[];
    channels?: string[];
    minQuantity?: number;
    maxQuantity?: number;
    minOrderValue?: number;
    maxOrderValue?: number;
    customerTier?: string;
    timeRange?: {
      start: Date;
      end: Date;
    };
    dayOfWeek?: number[];
    seasonality?: string;
  };

  @ApiProperty({ description: 'Pricing configuration' })
  @Prop({
    type: {
      basePrice: Number,
      markup: Number,
      margin: Number,
      tiers: [{
        minQuantity: Number,
        maxQuantity: Number,
        price: Number,
        discount: Number,
      }],
      formula: String,
      factors: Object,
    },
  })
  pricing: {
    basePrice?: number;
    markup?: number;
    margin?: number;
    tiers?: Array<{
      minQuantity: number;
      maxQuantity?: number;
      price: number;
      discount?: number;
    }>;
    formula?: string;
    factors?: Record<string, any>;
  };

  @ApiProperty({ description: 'Discount configuration' })
  @Prop({
    type: {
      type: { type: String, enum: DiscountType },
      value: Number,
      maxDiscount: Number,
      buyQuantity: Number,
      getQuantity: Number,
      loyaltyMultiplier: Number,
    },
  })
  discount?: {
    type: DiscountType;
    value: number;
    maxDiscount?: number;
    buyQuantity?: number;
    getQuantity?: number;
    loyaltyMultiplier?: number;
  };

  @ApiProperty({ description: 'Geographic pricing' })
  @Prop({
    type: {
      baseCurrency: String,
      exchangeRates: Object,
      localPricing: Object,
      taxRates: Object,
      shippingCosts: Object,
    },
  })
  geographic?: {
    baseCurrency: string;
    exchangeRates: Record<string, number>;
    localPricing: Record<string, number>;
    taxRates: Record<string, number>;
    shippingCosts: Record<string, number>;
  };

  @ApiProperty({ description: 'Dynamic pricing configuration' })
  @Prop({
    type: {
      demandMultiplier: Number,
      competitorPricing: Number,
      inventoryLevel: Number,
      seasonalityFactor: Number,
      aiModel: String,
      updateFrequency: Number,
    },
  })
  dynamic?: {
    demandMultiplier: number;
    competitorPricing: number;
    inventoryLevel: number;
    seasonalityFactor: number;
    aiModel: string;
    updateFrequency: number; // minutes
  };

  @ApiProperty({ description: 'A/B testing configuration' })
  @Prop({
    type: {
      testName: String,
      variants: [{
        name: String,
        percentage: Number,
        priceModifier: Number,
      }],
      isActive: Boolean,
    },
  })
  abTesting?: {
    testName: string;
    variants: Array<{
      name: string;
      percentage: number;
      priceModifier: number;
    }>;
    isActive: boolean;
  };

  @ApiProperty({ description: 'Rule metadata' })
  @Prop({
    type: {
      createdBy: String,
      approvedBy: String,
      version: Number,
      tags: [String],
      businessReason: String,
    },
  })
  metadata?: {
    createdBy: string;
    approvedBy?: string;
    version: number;
    tags: string[];
    businessReason: string;
  };

  @ApiProperty({ description: 'Rule validity period' })
  @Prop()
  validFrom?: Date;

  @ApiProperty({ description: 'Rule expiration date' })
  @Prop()
  validUntil?: Date;
}

export const PricingRuleSchema = SchemaFactory.createForClass(PricingRule);

// Create indexes for efficient pricing queries
PricingRuleSchema.index({ type: 1, scope: 1, isActive: 1 });
PricingRuleSchema.index({ priority: -1, isActive: 1 });
PricingRuleSchema.index({ 'conditions.productTypes': 1, isActive: 1 });
PricingRuleSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });
