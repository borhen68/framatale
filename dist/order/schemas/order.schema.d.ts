import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;
export declare enum OrderStatus {
    CREATED = "CREATED",
    PAYMENT_PENDING = "PAYMENT_PENDING",
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
    PROCESSING = "PROCESSING",
    PRINTING = "PRINTING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
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
export declare class Order {
    orderNumber: string;
    userId: Types.ObjectId;
    status: OrderStatus;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    payment?: PaymentInfo;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    supplierId?: Types.ObjectId;
    tracking?: {
        carrier?: string;
        trackingNumber?: string;
        trackingUrl?: string;
        shippedAt?: Date;
        estimatedDelivery?: Date;
        actualDelivery?: Date;
    };
    notes?: string;
    internalNotes?: string;
    history: Array<{
        status: string;
        timestamp: Date;
        note?: string;
        updatedBy?: string;
    }>;
    estimatedProductionDays?: number;
    isRushOrder: boolean;
    gift?: {
        isGift: boolean;
        giftMessage?: string;
        giftWrap?: boolean;
    };
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order, any> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
