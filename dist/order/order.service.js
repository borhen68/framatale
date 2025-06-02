"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const project_service_1 = require("../project/project.service");
let OrderService = class OrderService {
    orderModel;
    projectService;
    constructor(orderModel, projectService) {
        this.orderModel = orderModel;
        this.projectService = projectService;
    }
    async createOrder(request, user) {
        const orderItems = [];
        let subtotal = 0;
        for (const item of request.items) {
            const project = await this.projectService.findById(item.projectId, user);
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
        const tax = this.calculateTax(subtotal, request.shippingAddress);
        const shipping = this.calculateShipping(orderItems, request.shippingAddress, request.isRushOrder);
        const total = subtotal + tax + shipping;
        const orderNumber = await this.generateOrderNumber();
        const order = new this.orderModel({
            orderNumber,
            userId: user._id,
            status: order_schema_1.OrderStatus.CREATED,
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
                    status: order_schema_1.OrderStatus.CREATED,
                    timestamp: new Date(),
                    note: 'Order created',
                }],
            estimatedProductionDays: request.isRushOrder ? 3 : 7,
        });
        return order.save();
    }
    async findUserOrders(user) {
        return this.orderModel
            .find({ userId: user._id })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findById(orderId, user) {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId.toString() !== user._id.toString()) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateOrderStatus(orderId, newStatus, note, updatedBy) {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (!this.isValidStatusTransition(order.status, newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
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
    async addTrackingInfo(orderId, trackingInfo) {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        order.tracking = {
            ...trackingInfo,
            shippedAt: new Date(),
        };
        if (order.status !== order_schema_1.OrderStatus.SHIPPED) {
            order.status = order_schema_1.OrderStatus.SHIPPED;
            order.history.push({
                status: order_schema_1.OrderStatus.SHIPPED,
                timestamp: new Date(),
                note: `Shipped via ${trackingInfo.carrier} - ${trackingInfo.trackingNumber}`,
            });
        }
        return order.save();
    }
    async cancelOrder(orderId, user, reason) {
        const order = await this.findById(orderId, user);
        if (order.status === order_schema_1.OrderStatus.SHIPPED || order.status === order_schema_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Cannot cancel shipped or delivered orders');
        }
        if (order.status === order_schema_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Order is already cancelled');
        }
        order.status = order_schema_1.OrderStatus.CANCELLED;
        order.history.push({
            status: order_schema_1.OrderStatus.CANCELLED,
            timestamp: new Date(),
            note: reason || 'Order cancelled by customer',
        });
        return order.save();
    }
    async getOrderStatistics() {
        const totalOrders = await this.orderModel.countDocuments().exec();
        const statusAgg = await this.orderModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).exec();
        const ordersByStatus = statusAgg.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        const revenueAgg = await this.orderModel.aggregate([
            { $match: { status: { $in: [order_schema_1.OrderStatus.DELIVERED, order_schema_1.OrderStatus.SHIPPED] } } },
            { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrder: { $avg: '$total' } } }
        ]).exec();
        const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
        const averageOrderValue = revenueAgg[0]?.avgOrder || 0;
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
    calculateUnitPrice(productType, sizeCode, customizations) {
        const basePrices = {
            PHOTOBOOK: { '8x8': 25, '10x10': 35, 'A4': 30 },
            CALENDAR: { 'A4': 20, 'A3': 30 },
            CARD: { '5x7': 5, '6x6': 6 },
        };
        let price = basePrices[productType]?.[sizeCode] || 20;
        if (customizations?.paperType === 'premium')
            price += 5;
        if (customizations?.binding === 'hardcover')
            price += 10;
        if (customizations?.coating === 'glossy')
            price += 3;
        return price;
    }
    calculateTax(subtotal, address) {
        const taxRates = {
            'CA': 0.0875,
            'NY': 0.08,
            'TX': 0.0625,
        };
        const rate = taxRates[address.state] || 0;
        return Math.round(subtotal * rate * 100) / 100;
    }
    calculateShipping(items, address, isRush) {
        let baseShipping = 5.99;
        const itemShipping = items.reduce((total, item) => {
            const itemWeight = this.getItemWeight(item.productType, item.sizeCode);
            return total + (itemWeight * item.quantity * 0.5);
        }, 0);
        let totalShipping = baseShipping + itemShipping;
        if (isRush) {
            totalShipping += 15;
        }
        if (address.country !== 'US') {
            totalShipping += 20;
        }
        return Math.round(totalShipping * 100) / 100;
    }
    getItemWeight(productType, sizeCode) {
        const weights = {
            PHOTOBOOK: { '8x8': 1.5, '10x10': 2.0, 'A4': 1.8 },
            CALENDAR: { 'A4': 1.0, 'A3': 1.5 },
            CARD: { '5x7': 0.1, '6x6': 0.1 },
        };
        return weights[productType]?.[sizeCode] || 1.0;
    }
    async generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const todayCount = await this.orderModel.countDocuments({
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        }).exec();
        const sequence = (todayCount + 1).toString().padStart(4, '0');
        return `FT${year}${month}${day}${sequence}`;
    }
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [order_schema_1.OrderStatus.CREATED]: [order_schema_1.OrderStatus.PAYMENT_PENDING, order_schema_1.OrderStatus.CANCELLED],
            [order_schema_1.OrderStatus.PAYMENT_PENDING]: [order_schema_1.OrderStatus.PAYMENT_CONFIRMED, order_schema_1.OrderStatus.CANCELLED],
            [order_schema_1.OrderStatus.PAYMENT_CONFIRMED]: [order_schema_1.OrderStatus.PROCESSING, order_schema_1.OrderStatus.CANCELLED],
            [order_schema_1.OrderStatus.PROCESSING]: [order_schema_1.OrderStatus.PRINTING, order_schema_1.OrderStatus.CANCELLED],
            [order_schema_1.OrderStatus.PRINTING]: [order_schema_1.OrderStatus.SHIPPED],
            [order_schema_1.OrderStatus.SHIPPED]: [order_schema_1.OrderStatus.DELIVERED],
            [order_schema_1.OrderStatus.DELIVERED]: [order_schema_1.OrderStatus.REFUNDED],
            [order_schema_1.OrderStatus.CANCELLED]: [],
            [order_schema_1.OrderStatus.REFUNDED]: [],
        };
        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        project_service_1.ProjectService])
], OrderService);
//# sourceMappingURL=order.service.js.map