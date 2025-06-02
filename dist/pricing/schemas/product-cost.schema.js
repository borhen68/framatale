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
exports.ProductCostSchema = exports.ProductCost = exports.CostType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var CostType;
(function (CostType) {
    CostType["SUPPLIER_COST"] = "SUPPLIER_COST";
    CostType["MANUFACTURING_COST"] = "MANUFACTURING_COST";
    CostType["SHIPPING_COST"] = "SHIPPING_COST";
    CostType["HANDLING_COST"] = "HANDLING_COST";
    CostType["OVERHEAD_COST"] = "OVERHEAD_COST";
})(CostType || (exports.CostType = CostType = {}));
let ProductCost = class ProductCost {
    productType;
    variant;
    supplier;
    costs;
    volumeTiers;
    pricing;
    geographic;
    validFrom;
    validUntil;
    isActive;
    metadata;
};
exports.ProductCost = ProductCost;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product type (e.g., photo_book, canvas_print)' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProductCost.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product variant (size, quality, etc.)' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], ProductCost.prototype, "variant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier information' }),
    (0, mongoose_1.Prop)({
        type: {
            supplierId: String,
            supplierName: String,
            supplierSku: String,
            minimumOrderQuantity: Number,
            leadTime: Number,
            qualityRating: Number,
        },
    }),
    __metadata("design:type", Object)
], ProductCost.prototype, "supplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost breakdown' }),
    (0, mongoose_1.Prop)({
        type: {
            baseCost: Number,
            shippingCost: Number,
            handlingFee: Number,
            qualityControlCost: Number,
            packagingCost: Number,
            totalCost: Number,
        },
        required: true,
    }),
    __metadata("design:type", Object)
], ProductCost.prototype, "costs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Volume-based pricing tiers' }),
    (0, mongoose_1.Prop)({
        type: [{
                minQuantity: Number,
                maxQuantity: Number,
                unitCost: Number,
                discount: Number,
            }],
    }),
    __metadata("design:type", Array)
], ProductCost.prototype, "volumeTiers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target pricing strategy' }),
    (0, mongoose_1.Prop)({
        type: {
            targetSellingPrice: Number,
            targetMargin: Number,
            minimumMargin: Number,
            competitorPrice: Number,
            recommendedPrice: Number,
        },
    }),
    __metadata("design:type", Object)
], ProductCost.prototype, "pricing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Geographic cost variations' }),
    (0, mongoose_1.Prop)({
        type: {
            region: String,
            localCosts: {
                shipping: Number,
                taxes: Number,
                duties: Number,
                handling: Number,
            },
        },
    }),
    __metadata("design:type", Array)
], ProductCost.prototype, "geographic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost validity period' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ProductCost.prototype, "validFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost expiration date' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ProductCost.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether cost is active' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ProductCost.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            currency: String,
            lastUpdated: Date,
            updatedBy: String,
            notes: String,
            contractReference: String,
        },
    }),
    __metadata("design:type", Object)
], ProductCost.prototype, "metadata", void 0);
exports.ProductCost = ProductCost = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProductCost);
exports.ProductCostSchema = mongoose_1.SchemaFactory.createForClass(ProductCost);
exports.ProductCostSchema.index({ productType: 1, variant: 1, isActive: 1 });
exports.ProductCostSchema.index({ 'supplier.supplierId': 1, isActive: 1 });
exports.ProductCostSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });
//# sourceMappingURL=product-cost.schema.js.map