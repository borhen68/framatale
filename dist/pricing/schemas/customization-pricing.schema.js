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
exports.CustomizationPricingSchema = exports.CustomizationPricing = exports.PricingModel = exports.CustomizationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var CustomizationType;
(function (CustomizationType) {
    CustomizationType["EXTRA_PAGES"] = "EXTRA_PAGES";
    CustomizationType["COVER_UPGRADE"] = "COVER_UPGRADE";
    CustomizationType["PAPER_UPGRADE"] = "PAPER_UPGRADE";
    CustomizationType["SIZE_UPGRADE"] = "SIZE_UPGRADE";
    CustomizationType["BINDING_UPGRADE"] = "BINDING_UPGRADE";
    CustomizationType["LAMINATION"] = "LAMINATION";
    CustomizationType["FOIL_STAMPING"] = "FOIL_STAMPING";
    CustomizationType["EMBOSSING"] = "EMBOSSING";
    CustomizationType["DUST_JACKET"] = "DUST_JACKET";
    CustomizationType["GIFT_BOX"] = "GIFT_BOX";
})(CustomizationType || (exports.CustomizationType = CustomizationType = {}));
var PricingModel;
(function (PricingModel) {
    PricingModel["PER_UNIT"] = "PER_UNIT";
    PricingModel["FLAT_FEE"] = "FLAT_FEE";
    PricingModel["PERCENTAGE"] = "PERCENTAGE";
    PricingModel["TIERED"] = "TIERED";
})(PricingModel || (exports.PricingModel = PricingModel = {}));
let CustomizationPricing = class CustomizationPricing {
    productType;
    variant;
    customizationType;
    name;
    description;
    pricingModel;
    supplierCost;
    markup;
    customerPrice;
    tiers;
    limits;
    dependencies;
    supplierInfo;
    isActive;
    display;
    metadata;
};
exports.CustomizationPricing = CustomizationPricing;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product type this applies to' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], CustomizationPricing.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product variant (optional)' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], CustomizationPricing.prototype, "variant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CustomizationType, description: 'Type of customization' }),
    (0, mongoose_1.Prop)({ required: true, enum: CustomizationType, index: true }),
    __metadata("design:type", String)
], CustomizationPricing.prototype, "customizationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customization name' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CustomizationPricing.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customization description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CustomizationPricing.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PricingModel, description: 'How this customization is priced' }),
    (0, mongoose_1.Prop)({ required: true, enum: PricingModel }),
    __metadata("design:type", String)
], CustomizationPricing.prototype, "pricingModel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier cost for this customization' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CustomizationPricing.prototype, "supplierCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Your markup on this customization' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CustomizationPricing.prototype, "markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer price for this customization' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CustomizationPricing.prototype, "customerPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tiered pricing for different quantities' }),
    (0, mongoose_1.Prop)({
        type: [{
                minQuantity: Number,
                maxQuantity: Number,
                supplierCost: Number,
                customerPrice: Number,
                markup: Number,
            }],
    }),
    __metadata("design:type", Array)
], CustomizationPricing.prototype, "tiers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum and maximum allowed quantities' }),
    (0, mongoose_1.Prop)({
        type: {
            min: Number,
            max: Number,
            default: Number,
        },
    }),
    __metadata("design:type", Object)
], CustomizationPricing.prototype, "limits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dependencies on other customizations' }),
    (0, mongoose_1.Prop)({
        type: {
            requires: [String],
            excludes: [String],
            implies: [String],
        },
    }),
    __metadata("design:type", Object)
], CustomizationPricing.prototype, "dependencies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier-specific information' }),
    (0, mongoose_1.Prop)({
        type: {
            supplierId: String,
            supplierSku: String,
            processingTime: Number,
            availability: [String],
        },
    }),
    __metadata("design:type", Object)
], CustomizationPricing.prototype, "supplierInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether customization is active' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], CustomizationPricing.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display information for the editor' }),
    (0, mongoose_1.Prop)({
        type: {
            displayName: String,
            icon: String,
            category: String,
            sortOrder: Number,
            tooltip: String,
            previewImage: String,
        },
    }),
    __metadata("design:type", Object)
], CustomizationPricing.prototype, "display", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            tags: [String],
            popularity: Number,
            lastUsed: Date,
            totalUsage: Number,
        },
    }),
    __metadata("design:type", Object)
], CustomizationPricing.prototype, "metadata", void 0);
exports.CustomizationPricing = CustomizationPricing = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CustomizationPricing);
exports.CustomizationPricingSchema = mongoose_1.SchemaFactory.createForClass(CustomizationPricing);
exports.CustomizationPricingSchema.index({ productType: 1, customizationType: 1, isActive: 1 });
exports.CustomizationPricingSchema.index({ variant: 1, customizationType: 1, isActive: 1 });
exports.CustomizationPricingSchema.index({ 'display.category': 1, 'display.sortOrder': 1 });
//# sourceMappingURL=customization-pricing.schema.js.map