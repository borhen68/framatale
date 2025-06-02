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
exports.SupplierProductSchema = exports.SupplierProduct = exports.SupplierType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var SupplierType;
(function (SupplierType) {
    SupplierType["PRINTFUL"] = "PRINTFUL";
    SupplierType["PRINTIFY"] = "PRINTIFY";
    SupplierType["GOOTEN"] = "GOOTEN";
    SupplierType["PRODIGI"] = "PRODIGI";
    SupplierType["CLOUD_PRINT"] = "CLOUD_PRINT";
    SupplierType["RIP_PRINT"] = "RIP_PRINT";
})(SupplierType || (exports.SupplierType = SupplierType = {}));
let SupplierProduct = class SupplierProduct {
    supplier;
    supplierProductId;
    productType;
    variant;
    title;
    description;
    supplierPrice;
    sellingPrice;
    markup;
    markupPercentage;
    marginPercentage;
    specifications;
    shipping;
    volumePricing;
    apiInfo;
    isAvailable;
    isActive;
    metadata;
};
exports.SupplierProduct = SupplierProduct;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SupplierType, description: 'Supplier name' }),
    (0, mongoose_1.Prop)({ required: true, enum: SupplierType, index: true }),
    __metadata("design:type", String)
], SupplierProduct.prototype, "supplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier product ID' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], SupplierProduct.prototype, "supplierProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product type (photo_book, canvas_print, etc.)' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], SupplierProduct.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product variant (size, material, etc.)' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SupplierProduct.prototype, "variant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product title' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SupplierProduct.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SupplierProduct.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier wholesale price' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SupplierProduct.prototype, "supplierPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Your selling price' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SupplierProduct.prototype, "sellingPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Markup amount' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SupplierProduct.prototype, "markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Markup percentage' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SupplierProduct.prototype, "markupPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profit margin percentage' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SupplierProduct.prototype, "marginPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product specifications' }),
    (0, mongoose_1.Prop)({
        type: {
            width: Number,
            height: Number,
            unit: String,
            material: String,
            printMethod: String,
            weight: Number,
            pages: Number,
        },
    }),
    __metadata("design:type", Object)
], SupplierProduct.prototype, "specifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipping information' }),
    (0, mongoose_1.Prop)({
        type: {
            shippingCost: Number,
            processingTime: Number,
            shippingTime: Number,
            totalTime: Number,
            regions: [String],
        },
    }),
    __metadata("design:type", Object)
], SupplierProduct.prototype, "shipping", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Volume pricing tiers' }),
    (0, mongoose_1.Prop)({
        type: [{
                minQuantity: Number,
                maxQuantity: Number,
                supplierPrice: Number,
                sellingPrice: Number,
                markup: Number,
            }],
    }),
    __metadata("design:type", Array)
], SupplierProduct.prototype, "volumePricing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier API information' }),
    (0, mongoose_1.Prop)({
        type: {
            apiEndpoint: String,
            lastSynced: Date,
            syncStatus: String,
            apiVersion: String,
        },
    }),
    __metadata("design:type", Object)
], SupplierProduct.prototype, "apiInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product availability' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], SupplierProduct.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether product is active in your store' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], SupplierProduct.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            category: String,
            tags: [String],
            popularity: Number,
            lastOrdered: Date,
            totalOrders: Number,
            revenue: Number,
        },
    }),
    __metadata("design:type", Object)
], SupplierProduct.prototype, "metadata", void 0);
exports.SupplierProduct = SupplierProduct = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], SupplierProduct);
exports.SupplierProductSchema = mongoose_1.SchemaFactory.createForClass(SupplierProduct);
exports.SupplierProductSchema.index({ supplier: 1, productType: 1, isActive: 1 });
exports.SupplierProductSchema.index({ supplierProductId: 1, supplier: 1 });
exports.SupplierProductSchema.index({ productType: 1, variant: 1, isActive: 1 });
exports.SupplierProductSchema.index({ sellingPrice: 1, isActive: 1 });
exports.SupplierProductSchema.index({ markupPercentage: 1, isActive: 1 });
//# sourceMappingURL=supplier-product.schema.js.map