import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus, OrderItem, ShippingAddress } from './schemas/order.schema';
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

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private projectService: ProjectService,
  ) {}

  async createOrder(request: CreateOrderRequest, user: UserDocument): Promise<Order> {
    // Validate projects and calculate pricing
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of request.items) {
      // Verify user owns the project
      const project = await this.projectService.findById(item.projectId, user);

      // Calculate pricing (this would typically come from a pricing service)
      const unitPrice = this.calculateUnitPrice(item.productType, item.sizeCode, item.customizations);
      const totalPrice = unitPrice * item.quantity;

      orderItems.push({
        projectId: item.projectId,
        productType: item.productType,
        sizeCode: item.sizeCode,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        customizations: item.customizations,
      });

      subtotal += totalPrice;
    }

    // Calculate tax and shipping
    const tax = this.calculateTax(subtotal, request.shippingAddress);
    const shipping = this.calculateShipping(orderItems, request.shippingAddress, request.isRushOrder);
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = new this.orderModel({
      orderNumber,
      userId: user._id,
      status: OrderStatus.CREATED,
      items: orderItems,
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      subtotal,
      tax,
      shipping,
      total,
      notes: request.notes,
      isRushOrder: request.isRushOrder || false,
      gift: request.gift,
      history: [{
        status: OrderStatus.CREATED,
        timestamp: new Date(),
        note: 'Order created',
      }],
      estimatedProductionDays: request.isRushOrder ? 3 : 7,
    });

    return order.save();
  }

  async findUserOrders(user: UserDocument): Promise<Order[]> {
    return this.orderModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(orderId: string, user: UserDocument): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user owns the order
    if (order.userId.toString() !== (user._id as any).toString()) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    updatedBy?: string,
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, newStatus)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    order.status = newStatus;
    order.history.push({
      status: newStatus,
      timestamp: new Date(),
      note,
      updatedBy,
    });

    return order.save();
  }

  async addTrackingInfo(
    orderId: string,
    trackingInfo: {
      carrier: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDelivery?: Date;
    },
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.tracking = {
      ...trackingInfo,
      shippedAt: new Date(),
    };

    // Update status to shipped if not already
    if (order.status !== OrderStatus.SHIPPED) {
      order.status = OrderStatus.SHIPPED;
      order.history.push({
        status: OrderStatus.SHIPPED,
        timestamp: new Date(),
        note: `Shipped via ${trackingInfo.carrier} - ${trackingInfo.trackingNumber}`,
      });
    }

    return order.save();
  }

  async cancelOrder(orderId: string, user: UserDocument, reason?: string): Promise<Order> {
    const order = await this.findById(orderId, user);

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel shipped or delivered orders');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    order.history.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      note: reason || 'Order cancelled by customer',
    });

    return order.save();
  }

  async getOrderStatistics(): Promise<{
    totalOrders: number;
    ordersByStatus: Record<string, number>;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Array<{ productType: string; count: number }>;
  }> {
    const totalOrders = await this.orderModel.countDocuments().exec();

    // Orders by status
    const statusAgg = await this.orderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).exec();

    const ordersByStatus = statusAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Revenue calculation
    const revenueAgg = await this.orderModel.aggregate([
      { $match: { status: { $in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrder: { $avg: '$total' } } }
    ]).exec();

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const averageOrderValue = revenueAgg[0]?.avgOrder || 0;

    // Top products
    const productAgg = await this.orderModel.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productType', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).exec();

    const topProducts = productAgg.map(item => ({
      productType: item._id,
      count: item.count
    }));

    return {
      totalOrders,
      ordersByStatus,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topProducts,
    };
  }

  private calculateUnitPrice(productType: string, sizeCode: string, customizations?: any): number {
    // This would typically come from a pricing database or service
    const basePrices = {
      PHOTOBOOK: { '8x8': 25, '10x10': 35, 'A4': 30 },
      CALENDAR: { 'A4': 20, 'A3': 30 },
      CARD: { '5x7': 5, '6x6': 6 },
    };

    let price = basePrices[productType]?.[sizeCode] || 20;

    // Add customization costs
    if (customizations?.paperType === 'premium') price += 5;
    if (customizations?.binding === 'hardcover') price += 10;
    if (customizations?.coating === 'glossy') price += 3;

    return price;
  }

  private calculateTax(subtotal: number, address: ShippingAddress): number {
    // Simplified tax calculation - in production, use a tax service
    const taxRates = {
      'CA': 0.0875, // California
      'NY': 0.08,   // New York
      'TX': 0.0625, // Texas
    };

    const rate = taxRates[address.state] || 0;
    return Math.round(subtotal * rate * 100) / 100;
  }

  private calculateShipping(items: OrderItem[], address: ShippingAddress, isRush?: boolean): number {
    // Simplified shipping calculation
    let baseShipping = 5.99;

    // Add per-item shipping
    const itemShipping = items.reduce((total, item) => {
      const itemWeight = this.getItemWeight(item.productType, item.sizeCode);
      return total + (itemWeight * item.quantity * 0.5);
    }, 0);

    let totalShipping = baseShipping + itemShipping;

    // Rush order surcharge
    if (isRush) {
      totalShipping += 15;
    }

    // International shipping
    if (address.country !== 'US') {
      totalShipping += 20;
    }

    return Math.round(totalShipping * 100) / 100;
  }

  private getItemWeight(productType: string, sizeCode: string): number {
    // Weight in pounds
    const weights = {
      PHOTOBOOK: { '8x8': 1.5, '10x10': 2.0, 'A4': 1.8 },
      CALENDAR: { 'A4': 1.0, 'A3': 1.5 },
      CARD: { '5x7': 0.1, '6x6': 0.1 },
    };

    return weights[productType]?.[sizeCode] || 1.0;
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayCount = await this.orderModel.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    }).exec();

    const sequence = (todayCount + 1).toString().padStart(4, '0');

    return `FT${year}${month}${day}${sequence}`;
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.CREATED]: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
      [OrderStatus.PAYMENT_PENDING]: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.PAYMENT_CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.PRINTING, OrderStatus.CANCELLED],
      [OrderStatus.PRINTING]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
