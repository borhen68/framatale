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
exports.ProductSizeSchema = exports.ProductSize = exports.ProductType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var ProductType;
(function (ProductType) {
    ProductType["PHOTOBOOK"] = "PHOTOBOOK";
    ProductType["CALENDAR"] = "CALENDAR";
    ProductType["CARD"] = "CARD";
})(ProductType || (exports.ProductType = ProductType = {}));
let ProductSize = class ProductSize {
    type;
    sizeCode;
    widthMm;
    heightMm;
    aspectRatio;
    bleedMm;
    safeZoneMm;
    supplierId;
};
exports.ProductSize = ProductSize;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ProductType, description: 'Type of product' }),
    (0, mongoose_1.Prop)({ required: true, enum: ProductType }),
    __metadata("design:type", String)
], ProductSize.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Size code (e.g., 8x8, A4, 5x7)' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProductSize.prototype, "sizeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Width in millimeters' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductSize.prototype, "widthMm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Height in millimeters' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductSize.prototype, "heightMm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Aspect ratio' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductSize.prototype, "aspectRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bleed area in millimeters' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductSize.prototype, "bleedMm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Safe zone in millimeters' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductSize.prototype, "safeZoneMm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProductSize.prototype, "supplierId", void 0);
exports.ProductSize = ProductSize = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProductSize);
exports.ProductSizeSchema = mongoose_1.SchemaFactory.createForClass(ProductSize);
//# sourceMappingURL=product-size.schema.js.map