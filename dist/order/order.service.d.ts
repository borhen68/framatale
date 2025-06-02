import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus, ShippingAddress } from './schemas/order.schema';
import { ProjectService } from '../project/project.service';
import { UserDocument } from '../user/schemas/user.schema';
export interface CreateOrderRequest {
    items: Array<{
        projectId: string;
        productType: string;
        sizeCode: string;
        quantity: number;
        customizations?: any;
    }>;
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    notes?: string;
    isRushOrder?: boolean;
    gift?: {
        isGift: boolean;
        giftMessage?: string;
        giftWrap?: boolean;
    };
}
export declare class OrderService {
    private orderModel;
    private projectService;
    constructor(orderModel: Model<OrderDocument>, projectService: ProjectService);
    createOrder(request: CreateOrderRequest, user: UserDocument): Promise<Order>;
    findUserOrders(user: UserDocument): Promise<Order[]>;
    findById(orderId: string, user: UserDocument): Promise<OrderDocument>;
    updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string, updatedBy?: string): Promise<Order>;
    addTrackingInfo(orderId: string, trackingInfo: {
        carrier: string;
        trackingNumber: string;
        trackingUrl?: string;
        estimatedDelivery?: Date;
    }): Promise<Order>;
    cancelOrder(orderId: string, user: UserDocument, reason?: string): Promise<Order>;
    getOrderStatistics(): Promise<{
        totalOrders: number;
        ordersByStatus: Record<string, number>;
        totalRevenue: number;
        averageOrderValue: number;
        topProducts: Array<{
            productType: string;
            count: number;
        }>;
    }>;
    private calculateUnitPrice;
    private calculateTax;
    private calculateShipping;
    private getItemWeight;
    private generateOrderNumber;
    private isValidStatusTransition;
}
