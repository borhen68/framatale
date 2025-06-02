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
exports.PricingRuleSchema = exports.PricingRule = exports.DiscountType = exports.PricingScope = exports.PricingType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var PricingType;
(function (PricingType) {
    PricingType["FIXED"] = "FIXED";
    PricingType["PERCENTAGE"] = "PERCENTAGE";
    PricingType["TIERED"] = "TIERED";
    PricingType["VOLUME"] = "VOLUME";
    PricingType["DYNAMIC"] = "DYNAMIC";
    PricingType["SUBSCRIPTION"] = "SUBSCRIPTION";
})(PricingType || (exports.PricingType = PricingType = {}));
var PricingScope;
(function (PricingScope) {
    PricingScope["GLOBAL"] = "GLOBAL";
    PricingScope["PRODUCT"] = "PRODUCT";
    PricingScope["USER"] = "USER";
    PricingScope["REGION"] = "REGION";
    PricingScope["CHANNEL"] = "CHANNEL";
})(PricingScope || (exports.PricingScope = PricingScope = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["FIXED_AMOUNT"] = "FIXED_AMOUNT";
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["BUY_X_GET_Y"] = "BUY_X_GET_Y";
    DiscountType["BULK_DISCOUNT"] = "BULK_DISCOUNT";
    DiscountType["LOYALTY_DISCOUNT"] = "LOYALTY_DISCOUNT";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
let PricingRule = class PricingRule {
    name;
    description;
    type;
    scope;
    priority;
    isActive;
    conditions;
    pricing;
    discount;
    geographic;
    dynamic;
    abTesting;
    metadata;
    validFrom;
    validUntil;
};
exports.PricingRule = PricingRule;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule name' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PricingRule.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PricingRule.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PricingType, description: 'Type of pricing rule' }),
    (0, mongoose_1.Prop)({ required: true, enum: PricingType }),
    __metadata("design:type", String)
], PricingRule.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PricingScope, description: 'Scope of pricing rule' }),
    (0, mongoose_1.Prop)({ required: true, enum: PricingScope }),
    __metadata("design:type", String)
], PricingRule.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Priority (higher number = higher priority)' }),
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], PricingRule.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether rule is active' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PricingRule.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule conditions' }),
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", Object)
], PricingRule.prototype, "conditions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pricing configuration' }),
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", Object)
], PricingRule.prototype, "pricing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount configuration' }),
    (0, mongoose_1.Prop)({
        type: {
            type: { type: String, enum: DiscountType },
            value: Number,
            maxDiscount: Number,
            buyQuantity: Number,
            getQuantity: Number,
            loyaltyMultiplier: Number,
        },
    }),
    __metadata("design:type", Object)
], PricingRule.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Geographic pricing' }),
    (0, mongoose_1.Prop)({
        type: {
            baseCurrency: String,
            exchangeRates: Object,
            localPricing: Object,
            taxRates: Object,
            shippingCosts: Object,
        },
    }),
    __metadata("design:type", Object)
], PricingRule.prototype, "geographic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dynamic pricing configuration' }),
    (0, mongoose_1.Prop)({
        type: {
            demandMultiplier: Number,
            competitorPricing: Number,
            inventoryLevel: Number,
            seasonalityFactor: Number,
            aiModel: String,
            updateFrequency: Number,
        },
    }),
    __metadata("design:type", Object)
], PricingRule.prototype, "dynamic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'A/B testing configuration' }),
    (0, mongoose_1.Prop)({
        type: {
            testName: String,
            variants: [{
                    name: String,
                    percentage: Number,
                    priceModifier: Number,
                }],
            isActive: Boolean,
        },
    }),
    __metadata("design:type", Object)
], PricingRule.prototype, "abTesting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            createdBy: String,
            approvedBy: String,
            version: Number,
            tags: [String],
            businessReason: String,
        },
    }),
    __metadata("design:type", Object)
], PricingRule.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule validity period' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PricingRule.prototype, "validFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule expiration date' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PricingRule.prototype, "validUntil", void 0);
exports.PricingRule = PricingRule = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PricingRule);
exports.PricingRuleSchema = mongoose_1.SchemaFactory.createForClass(PricingRule);
exports.PricingRuleSchema.index({ type: 1, scope: 1, isActive: 1 });
exports.PricingRuleSchema.index({ priority: -1, isActive: 1 });
exports.PricingRuleSchema.index({ 'conditions.productTypes': 1, isActive: 1 });
exports.PricingRuleSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });
//# sourceMappingURL=pricing-rule.schema.js.map