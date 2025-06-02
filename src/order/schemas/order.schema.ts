import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  CREATED = 'CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PROCESSING = 'PROCESSING',
  PRINTING = 'PRINTING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItem {
  projectId: string;
  productType: string;
  sizeCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: {
    paperType?: string;
    binding?: string;
    coating?: string;
    specialInstructions?: string;
  };
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentInfo {
  method: 'credit_card' | 'paypal' | 'stripe' | 'bank_transfer';
  transactionId?: string;
  paymentIntentId?: string;
  amount: number;
  currency: string;
  paidAt?: Date;
}

@Schema({ timestamps: true })
export class Order {
  @ApiProperty({ description: 'Order number (unique)' })
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @ApiProperty({ description: 'User who placed the order' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ enum: OrderStatus, description: 'Order status' })
  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  @ApiProperty({ description: 'Order items' })
  @Prop({ type: [Object], required: true })
  items: OrderItem[];

  @ApiProperty({ description: 'Shipping address' })
  @Prop({ type: Object, required: true })
  shippingAddress: ShippingAddress;

  @ApiProperty({ description: 'Billing address (if different from shipping)' })
  @Prop({ type: Object })
  billingAddress?: ShippingAddress;

  @ApiProperty({ description: 'Payment information' })
  @Prop({ type: Object })
  payment?: PaymentInfo;

  @ApiProperty({ description: 'Subtotal amount' })
  @Prop({ required: true })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount' })
  @Prop({ default: 0 })
  tax: number;

  @ApiProperty({ description: 'Shipping cost' })
  @Prop({ default: 0 })
  shipping: number;

  @ApiProperty({ description: 'Discount amount' })
  @Prop({ default: 0 })
  discount: number;

  @ApiProperty({ description: 'Total amount' })
  @Prop({ required: true })
  total: number;

  @ApiProperty({ description: 'Currency code' })
  @Prop({ required: true, default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Supplier assigned to fulfill the order' })
  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplierId?: Types.ObjectId;

  @ApiProperty({ description: 'Tracking information' })
  @Prop({
    type: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      shippedAt: Date,
      estimatedDelivery: Date,
      actualDelivery: Date,
    },
  })
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippedAt?: Date;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
  };

  @ApiProperty({ description: 'Order notes and special instructions' })
  @Prop()
  notes?: string;

  @ApiProperty({ description: 'Customer service notes (internal)' })
  @Prop()
  internalNotes?: string;

  @ApiProperty({ description: 'Order timeline/history' })
  @Prop({
    type: [{
      status: String,
      timestamp: Date,
      note: String,
      updatedBy: String,
    }],
  })
  history: Array<{
    status: string;
    timestamp: Date;
    note?: string;
    updatedBy?: string;
  }>;

  @ApiProperty({ description: 'Estimated production time in days' })
  @Prop()
  estimatedProductionDays?: number;

  @ApiProperty({ description: 'Rush order flag' })
  @Prop({ default: false })
  isRushOrder: boolean;

  @ApiProperty({ description: 'Gift order information' })
  @Prop({
    type: {
      isGift: Boolean,
      giftMessage: String,
      giftWrap: Boolean,
    },
  })
  gift?: {
    isGift: boolean;
    giftMessage?: string;
    giftWrap?: boolean;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
