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
exports.NotificationSchema = exports.Notification = exports.NotificationStatus = exports.NotificationChannel = exports.NotificationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER_CREATED"] = "ORDER_CREATED";
    NotificationType["ORDER_CONFIRMED"] = "ORDER_CONFIRMED";
    NotificationType["ORDER_SHIPPED"] = "ORDER_SHIPPED";
    NotificationType["ORDER_DELIVERED"] = "ORDER_DELIVERED";
    NotificationType["EXPORT_READY"] = "EXPORT_READY";
    NotificationType["ENHANCEMENT_COMPLETE"] = "ENHANCEMENT_COMPLETE";
    NotificationType["PROJECT_SHARED"] = "PROJECT_SHARED";
    NotificationType["SYSTEM_MAINTENANCE"] = "SYSTEM_MAINTENANCE";
    NotificationType["PROMOTIONAL"] = "PROMOTIONAL";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["IN_APP"] = "IN_APP";
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["PUSH"] = "PUSH";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["DELIVERED"] = "DELIVERED";
    NotificationStatus["FAILED"] = "FAILED";
    NotificationStatus["READ"] = "READ";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
let Notification = class Notification {
    userId;
    type;
    channel;
    status;
    title;
    message;
    content;
    relatedEntity;
    priority;
    scheduledAt;
    sentAt;
    deliveredAt;
    readAt;
    expiresAt;
    errorMessage;
    retryCount;
    externalMessageId;
};
exports.Notification = Notification;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient user ID' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: NotificationType, description: 'Type of notification' }),
    (0, mongoose_1.Prop)({ required: true, enum: NotificationType }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: NotificationChannel, description: 'Delivery channel' }),
    (0, mongoose_1.Prop)({ required: true, enum: NotificationChannel }),
    __metadata("design:type", String)
], Notification.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: NotificationStatus, description: 'Notification status' }),
    (0, mongoose_1.Prop)({ required: true, enum: NotificationStatus, default: NotificationStatus.PENDING }),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification title' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification message' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rich content data' }),
    (0, mongoose_1.Prop)({
        type: {
            html: String,
            imageUrl: String,
            actionUrl: String,
            actionText: String,
            metadata: Object,
        },
    }),
    __metadata("design:type", Object)
], Notification.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related entity reference' }),
    (0, mongoose_1.Prop)({
        type: {
            entityType: String,
            entityId: String,
        },
    }),
    __metadata("design:type", Object)
], Notification.prototype, "relatedEntity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification priority' }),
    (0, mongoose_1.Prop)({ enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' }),
    __metadata("design:type", String)
], Notification.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Scheduled send time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual send time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "sentAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery confirmation time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "deliveredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Read time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if delivery failed' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of retry attempts' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Notification.prototype, "retryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'External service message ID' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "externalMessageId", void 0);
exports.Notification = Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
//# sourceMappingURL=notification.schema.js.map