import { OrderService, CreateOrderRequest } from './order.service';
import { Order, OrderStatus } from './schemas/order.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class OrderController {
    private orderService;
    constructor(orderService: OrderService);
    createOrder(request: CreateOrderRequest, user: UserDocument): Promise<Order>;
    getUserOrders(user: UserDocument): Promise<Order[]>;
    getStatistics(): Promise<any>;
    getOrder(orderId: string, user: UserDocument): Promise<Order>;
    cancelOrder(orderId: string, reason: string, user: UserDocument): Promise<Order>;
    updateStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order>;
    addTracking(orderId: string, trackingInfo: {
        carrier: string;
        trackingNumber: string;
        trackingUrl?: string;
        estimatedDelivery?: Date;
    }): Promise<Order>;
}
