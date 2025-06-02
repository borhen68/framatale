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
exports.CanvasSchema = exports.Canvas = exports.ElementType = exports.CanvasType = exports.ProductType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var ProductType;
(function (ProductType) {
    ProductType["PHOTO_BOOK"] = "PHOTO_BOOK";
    ProductType["GREETING_CARD"] = "GREETING_CARD";
    ProductType["BUSINESS_CARD"] = "BUSINESS_CARD";
    ProductType["CALENDAR"] = "CALENDAR";
    ProductType["POSTER"] = "POSTER";
    ProductType["FLYER"] = "FLYER";
})(ProductType || (exports.ProductType = ProductType = {}));
var CanvasType;
(function (CanvasType) {
    CanvasType["COVER"] = "COVER";
    CanvasType["PAGE"] = "PAGE";
    CanvasType["SPREAD"] = "SPREAD";
    CanvasType["SINGLE"] = "SINGLE";
    CanvasType["MONTH"] = "MONTH";
})(CanvasType || (exports.CanvasType = CanvasType = {}));
var ElementType;
(function (ElementType) {
    ElementType["IMAGE"] = "IMAGE";
    ElementType["TEXT"] = "TEXT";
    ElementType["SHAPE"] = "SHAPE";
    ElementType["BACKGROUND"] = "BACKGROUND";
    ElementType["PLACEHOLDER"] = "PLACEHOLDER";
})(ElementType || (exports.ElementType = ElementType = {}));
let Canvas = class Canvas {
    _id;
    projectId;
    productType;
    canvasType;
    name;
    order;
    dimensions;
    background;
    elements;
    template;
    metadata;
    createdAt;
    updatedAt;
};
exports.Canvas = Canvas;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas ID' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Canvas.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project this canvas belongs to' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Project', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Canvas.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ProductType, description: 'Product type' }),
    (0, mongoose_1.Prop)({ required: true, enum: ProductType, index: true }),
    __metadata("design:type", String)
], Canvas.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CanvasType, description: 'Canvas type' }),
    (0, mongoose_1.Prop)({ required: true, enum: CanvasType }),
    __metadata("design:type", String)
], Canvas.prototype, "canvasType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas name/title' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Canvas.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas order/position in project' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Number)
], Canvas.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas dimensions and settings' }),
    (0, mongoose_1.Prop)({
        type: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
            unit: { type: String, default: 'px' },
            dpi: { type: Number, default: 300 },
            bleed: { type: Number, default: 0 },
            safeZone: { type: Number, default: 5 },
            orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Canvas.prototype, "dimensions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas background' }),
    (0, mongoose_1.Prop)({
        type: {
            type: { type: String, enum: ['color', 'image', 'gradient'], default: 'color' },
            color: { type: String, default: '#ffffff' },
            image: {
                url: String,
                opacity: { type: Number, default: 1 },
                position: { type: String, default: 'center' },
                size: { type: String, default: 'cover' },
            },
            gradient: {
                type: { type: String, enum: ['linear', 'radial'], default: 'linear' },
                colors: [String],
                direction: { type: String, default: '0deg' },
            },
        },
    }),
    __metadata("design:type", Object)
], Canvas.prototype, "background", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas elements (images, text, shapes)' }),
    (0, mongoose_1.Prop)({
        type: [{
                id: { type: String, required: true },
                type: { type: String, enum: Object.values(ElementType), required: true },
                name: { type: String, required: true },
                position: {
                    x: { type: Number, required: true },
                    y: { type: Number, required: true },
                    z: { type: Number, default: 0 },
                },
                size: {
                    width: { type: Number, required: true },
                    height: { type: Number, required: true },
                },
                rotation: { type: Number, default: 0 },
                opacity: { type: Number, default: 1 },
                visible: { type: Boolean, default: true },
                locked: { type: Boolean, default: false },
                image: {
                    url: String,
                    originalUrl: String,
                    crop: {
                        x: Number,
                        y: Number,
                        width: Number,
                        height: Number,
                    },
                    filters: {
                        brightness: { type: Number, default: 100 },
                        contrast: { type: Number, default: 100 },
                        saturation: { type: Number, default: 100 },
                        blur: { type: Number, default: 0 },
                        sepia: { type: Number, default: 0 },
                    },
                },
                text: {
                    content: String,
                    fontFamily: { type: String, default: 'Arial' },
                    fontSize: { type: Number, default: 16 },
                    fontWeight: { type: String, default: 'normal' },
                    fontStyle: { type: String, default: 'normal' },
                    color: { type: String, default: '#000000' },
                    align: { type: String, enum: ['left', 'center', 'right', 'justify'], default: 'left' },
                    lineHeight: { type: Number, default: 1.2 },
                    letterSpacing: { type: Number, default: 0 },
                    textDecoration: { type: String, default: 'none' },
                },
                shape: {
                    type: { type: String, enum: ['rectangle', 'circle', 'triangle', 'polygon'] },
                    fill: { type: String, default: '#000000' },
                    stroke: {
                        color: { type: String, default: '#000000' },
                        width: { type: Number, default: 0 },
                        style: { type: String, enum: ['solid', 'dashed', 'dotted'], default: 'solid' },
                    },
                    cornerRadius: { type: Number, default: 0 },
                },
            }],
        default: [],
    }),
    __metadata("design:type", Array)
], Canvas.prototype, "elements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template information if canvas is based on template' }),
    (0, mongoose_1.Prop)({
        type: {
            templateId: { type: mongoose_2.Types.ObjectId, ref: 'Template' },
            templateName: String,
            templateCategory: String,
            appliedAt: { type: Date, default: Date.now },
            customizations: [String],
        },
    }),
    __metadata("design:type", Object)
], Canvas.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            isTemplate: { type: Boolean, default: false },
            tags: [String],
            notes: String,
            lastEditedBy: { type: mongoose_2.Types.ObjectId, ref: 'User' },
            version: { type: Number, default: 1 },
            printReady: { type: Boolean, default: false },
            previewUrl: String,
            thumbnailUrl: String,
        },
    }),
    __metadata("design:type", Object)
], Canvas.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas creation date' }),
    __metadata("design:type", Date)
], Canvas.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canvas last update date' }),
    __metadata("design:type", Date)
], Canvas.prototype, "updatedAt", void 0);
exports.Canvas = Canvas = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Canvas);
exports.CanvasSchema = mongoose_1.SchemaFactory.createForClass(Canvas);
exports.CanvasSchema.index({ projectId: 1, order: 1 });
exports.CanvasSchema.index({ productType: 1, canvasType: 1 });
exports.CanvasSchema.index({ 'template.templateId': 1 });
exports.CanvasSchema.index({ 'metadata.isTemplate': 1, productType: 1 });
//# sourceMappingURL=canvas.schema.js.map