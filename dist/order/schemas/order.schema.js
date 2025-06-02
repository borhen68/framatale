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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = exports.Order = exports.OrderStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CREATED"] = "CREATED";
    OrderStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    OrderStatus["PAYMENT_CONFIRMED"] = "PAYMENT_CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["PRINTING"] = "PRINTING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let Order = class Order {
    orderNumber;
    userId;
    status;
    items;
    shippingAddress;
    billingAddress;
    payment;
    subtotal;
    tax;
    shipping;
    discount;
    total;
    currency;
    supplierId;
    tracking;
    notes;
    internalNotes;
    history;
    estimatedProductionDays;
    isRushOrder;
    gift;
};
exports.Order = Order;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order number (unique)' }),
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who placed the order' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: OrderStatus, description: 'Order status' }),
    (0, mongoose_1.Prop)({ required: true, enum: OrderStatus, default: OrderStatus.CREATED }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order items' }),
    (0, mongoose_1.Prop)({ type: [Object], required: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipping address' }),
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Order.prototype, "shippingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing address (if different from shipping)' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Order.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment information' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Order.prototype, "payment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subtotal amount' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Order.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tax amount' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "tax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipping cost' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "shipping", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount amount' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Order.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code' }),
    (0, mongoose_1.Prop)({ required: true, default: 'USD' }),
    __metadata("design:type", String)
], Order.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier assigned to fulfill the order' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Supplier' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tracking information' }),
    (0, mongoose_1.Prop)({
        type: {
            carrier: String,
            trackingNumber: String,
            trackingUrl: String,
            shippedAt: Date,
            estimatedDelivery: Date,
            actualDelivery: Date,
        },
    }),
    __metadata("design:type", Object)
], Order.prototype, "tracking", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order notes and special instructions' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer service notes (internal)' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Order.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order timeline/history' }),
    (0, mongoose_1.Prop)({
        type: [{
                status: String,
                timestamp: Date,
                note: String,
                updatedBy: String,
            }],
    }),
    __metadata("design:type", Array)
], Order.prototype, "history", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated production time in days' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Order.prototype, "estimatedProductionDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rush order flag' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "isRushOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gift order information' }),
    (0, mongoose_1.Prop)({
        type: {
            isGift: Boolean,
            giftMessage: String,
            giftWrap: Boolean,
        },
    }),
    __metadata("design:type", Object)
], Order.prototype, "gift", void 0);
exports.Order = Order = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Order);
exports.OrderSchema = mongoose_1.SchemaFactory.createForClass(Order);
//# sourceMappingURL=order.schema.js.map