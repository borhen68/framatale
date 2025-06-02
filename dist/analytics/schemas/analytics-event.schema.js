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
exports.AnalyticsEventSchema = exports.AnalyticsEvent = exports.EventCategory = exports.EventType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var EventType;
(function (EventType) {
    EventType["USER_REGISTERED"] = "USER_REGISTERED";
    EventType["USER_LOGIN"] = "USER_LOGIN";
    EventType["USER_LOGOUT"] = "USER_LOGOUT";
    EventType["PROJECT_CREATED"] = "PROJECT_CREATED";
    EventType["PROJECT_VIEWED"] = "PROJECT_VIEWED";
    EventType["PROJECT_EDITED"] = "PROJECT_EDITED";
    EventType["PROJECT_DELETED"] = "PROJECT_DELETED";
    EventType["PROJECT_SHARED"] = "PROJECT_SHARED";
    EventType["IMAGE_UPLOADED"] = "IMAGE_UPLOADED";
    EventType["IMAGE_DOWNLOADED"] = "IMAGE_DOWNLOADED";
    EventType["IMAGE_ENHANCED"] = "IMAGE_ENHANCED";
    EventType["TEMPLATE_VIEWED"] = "TEMPLATE_VIEWED";
    EventType["TEMPLATE_APPLIED"] = "TEMPLATE_APPLIED";
    EventType["TEMPLATE_RATED"] = "TEMPLATE_RATED";
    EventType["EXPORT_STARTED"] = "EXPORT_STARTED";
    EventType["EXPORT_COMPLETED"] = "EXPORT_COMPLETED";
    EventType["EXPORT_DOWNLOADED"] = "EXPORT_DOWNLOADED";
    EventType["ORDER_CREATED"] = "ORDER_CREATED";
    EventType["ORDER_PAID"] = "ORDER_PAID";
    EventType["ORDER_SHIPPED"] = "ORDER_SHIPPED";
    EventType["ORDER_DELIVERED"] = "ORDER_DELIVERED";
    EventType["ORDER_CANCELLED"] = "ORDER_CANCELLED";
    EventType["PAGE_VIEW"] = "PAGE_VIEW";
    EventType["FEATURE_USED"] = "FEATURE_USED";
    EventType["ERROR_OCCURRED"] = "ERROR_OCCURRED";
    EventType["SEARCH_PERFORMED"] = "SEARCH_PERFORMED";
})(EventType || (exports.EventType = EventType = {}));
var EventCategory;
(function (EventCategory) {
    EventCategory["USER"] = "USER";
    EventCategory["PROJECT"] = "PROJECT";
    EventCategory["MEDIA"] = "MEDIA";
    EventCategory["TEMPLATE"] = "TEMPLATE";
    EventCategory["EXPORT"] = "EXPORT";
    EventCategory["ORDER"] = "ORDER";
    EventCategory["ENGAGEMENT"] = "ENGAGEMENT";
    EventCategory["SYSTEM"] = "SYSTEM";
})(EventCategory || (exports.EventCategory = EventCategory = {}));
let AnalyticsEvent = class AnalyticsEvent {
    eventType;
    category;
    userId;
    sessionId;
    properties;
    userAgent;
    ipAddress;
    referrer;
    url;
    device;
    location;
    value;
    currency;
    abTestVariant;
    timestamp;
};
exports.AnalyticsEvent = AnalyticsEvent;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EventType, description: 'Type of event' }),
    (0, mongoose_1.Prop)({ required: true, enum: EventType, index: true }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "eventType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EventCategory, description: 'Event category' }),
    (0, mongoose_1.Prop)({ required: true, enum: EventCategory, index: true }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID (if applicable)' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AnalyticsEvent.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event properties' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AnalyticsEvent.prototype, "properties", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User agent string' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IP address' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Referrer URL' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "referrer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Page URL' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device information' }),
    (0, mongoose_1.Prop)({
        type: {
            type: String,
            os: String,
            browser: String,
            isMobile: Boolean,
            screenResolution: String,
        },
    }),
    __metadata("design:type", Object)
], AnalyticsEvent.prototype, "device", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Geographic location' }),
    (0, mongoose_1.Prop)({
        type: {
            country: String,
            region: String,
            city: String,
            timezone: String,
        },
    }),
    __metadata("design:type", Object)
], AnalyticsEvent.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event value (for revenue tracking)' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], AnalyticsEvent.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'A/B test variant' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AnalyticsEvent.prototype, "abTestVariant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event timestamp' }),
    (0, mongoose_1.Prop)({ default: Date.now, index: true }),
    __metadata("design:type", Date)
], AnalyticsEvent.prototype, "timestamp", void 0);
exports.AnalyticsEvent = AnalyticsEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AnalyticsEvent);
exports.AnalyticsEventSchema = mongoose_1.SchemaFactory.createForClass(AnalyticsEvent);
exports.AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
exports.AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
exports.AnalyticsEventSchema.index({ category: 1, timestamp: -1 });
exports.AnalyticsEventSchema.index({ timestamp: -1 });
//# sourceMappingURL=analytics-event.schema.js.map