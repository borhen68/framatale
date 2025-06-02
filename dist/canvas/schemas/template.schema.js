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
exports.TemplateSchema = exports.Template = exports.TemplateStyle = exports.TemplateCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const canvas_schema_1 = require("./canvas.schema");
var TemplateCategory;
(function (TemplateCategory) {
    TemplateCategory["WEDDING"] = "WEDDING";
    TemplateCategory["BIRTHDAY"] = "BIRTHDAY";
    TemplateCategory["BABY"] = "BABY";
    TemplateCategory["TRAVEL"] = "TRAVEL";
    TemplateCategory["FAMILY"] = "FAMILY";
    TemplateCategory["BUSINESS"] = "BUSINESS";
    TemplateCategory["HOLIDAY"] = "HOLIDAY";
    TemplateCategory["GRADUATION"] = "GRADUATION";
    TemplateCategory["ANNIVERSARY"] = "ANNIVERSARY";
    TemplateCategory["MINIMALIST"] = "MINIMALIST";
    TemplateCategory["VINTAGE"] = "VINTAGE";
    TemplateCategory["MODERN"] = "MODERN";
    TemplateCategory["ELEGANT"] = "ELEGANT";
    TemplateCategory["CREATIVE"] = "CREATIVE";
    TemplateCategory["SEASONAL"] = "SEASONAL";
})(TemplateCategory || (exports.TemplateCategory = TemplateCategory = {}));
var TemplateStyle;
(function (TemplateStyle) {
    TemplateStyle["CLASSIC"] = "CLASSIC";
    TemplateStyle["MODERN"] = "MODERN";
    TemplateStyle["MINIMALIST"] = "MINIMALIST";
    TemplateStyle["VINTAGE"] = "VINTAGE";
    TemplateStyle["ELEGANT"] = "ELEGANT";
    TemplateStyle["PLAYFUL"] = "PLAYFUL";
    TemplateStyle["PROFESSIONAL"] = "PROFESSIONAL";
    TemplateStyle["ARTISTIC"] = "ARTISTIC";
})(TemplateStyle || (exports.TemplateStyle = TemplateStyle = {}));
let Template = class Template {
    _id;
    name;
    description;
    productType;
    canvasType;
    category;
    style;
    dimensions;
    canvases;
    previews;
    pricing;
    metadata;
    indesign;
    createdAt;
    updatedAt;
};
exports.Template = Template;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template ID' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Template.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Template.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Template.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: canvas_schema_1.ProductType, description: 'Product type this template is for' }),
    (0, mongoose_1.Prop)({ required: true, enum: canvas_schema_1.ProductType, index: true }),
    __metadata("design:type", String)
], Template.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: canvas_schema_1.CanvasType, description: 'Canvas type (for single canvas templates)' }),
    (0, mongoose_1.Prop)({ enum: canvas_schema_1.CanvasType }),
    __metadata("design:type", String)
], Template.prototype, "canvasType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TemplateCategory, description: 'Template category' }),
    (0, mongoose_1.Prop)({ required: true, enum: TemplateCategory, index: true }),
    __metadata("design:type", String)
], Template.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TemplateStyle, description: 'Template style' }),
    (0, mongoose_1.Prop)({ required: true, enum: TemplateStyle, index: true }),
    __metadata("design:type", String)
], Template.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template dimensions and specifications' }),
    (0, mongoose_1.Prop)({
        type: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
            unit: { type: String, default: 'px' },
            dpi: { type: Number, default: 300 },
            orientation: { type: String, enum: ['portrait', 'landscape'], required: true },
            pageCount: { type: Number, default: 1 },
            spreadCount: { type: Number, default: 0 },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Template.prototype, "dimensions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template canvas data' }),
    (0, mongoose_1.Prop)({
        type: [{
                canvasType: { type: String, enum: Object.values(canvas_schema_1.CanvasType), required: true },
                name: { type: String, required: true },
                order: { type: Number, required: true },
                dimensions: {
                    width: Number,
                    height: Number,
                    unit: String,
                    dpi: Number,
                    bleed: Number,
                    safeZone: Number,
                    orientation: String,
                },
                background: {
                    type: String,
                    color: String,
                    image: {
                        url: String,
                        opacity: Number,
                        position: String,
                        size: String,
                    },
                    gradient: {
                        type: String,
                        colors: [String],
                        direction: String,
                    },
                },
                elements: [{
                        id: String,
                        type: String,
                        name: String,
                        position: { x: Number, y: Number, z: Number },
                        size: { width: Number, height: Number },
                        rotation: Number,
                        opacity: Number,
                        visible: Boolean,
                        locked: Boolean,
                        isPlaceholder: { type: Boolean, default: false },
                        placeholderType: { type: String, enum: ['image', 'text'] },
                        placeholderText: String,
                        image: {
                            url: String,
                            originalUrl: String,
                            crop: { x: Number, y: Number, width: Number, height: Number },
                            filters: {
                                brightness: Number,
                                contrast: Number,
                                saturation: Number,
                                blur: Number,
                                sepia: Number,
                            },
                        },
                        text: {
                            content: String,
                            fontFamily: String,
                            fontSize: Number,
                            fontWeight: String,
                            fontStyle: String,
                            color: String,
                            align: String,
                            lineHeight: Number,
                            letterSpacing: Number,
                            textDecoration: String,
                        },
                        shape: {
                            type: String,
                            fill: String,
                            stroke: {
                                color: String,
                                width: Number,
                                style: String,
                            },
                            cornerRadius: Number,
                        },
                    }],
            }],
        required: true,
    }),
    __metadata("design:type", Array)
], Template.prototype, "canvases", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template preview images' }),
    (0, mongoose_1.Prop)({
        type: {
            thumbnail: { type: String, required: true },
            preview: { type: String, required: true },
            fullPreview: String,
            mockup: String,
            gallery: [String],
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Template.prototype, "previews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template pricing and availability' }),
    (0, mongoose_1.Prop)({
        type: {
            isPremium: { type: Boolean, default: false },
            price: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
            isPublic: { type: Boolean, default: true },
            requiredSubscription: String,
        },
    }),
    __metadata("design:type", Object)
], Template.prototype, "pricing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template metadata and analytics' }),
    (0, mongoose_1.Prop)({
        type: {
            tags: [String],
            colors: [String],
            difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
            estimatedTime: Number,
            usageCount: { type: Number, default: 0 },
            rating: { type: Number, default: 0 },
            ratingCount: { type: Number, default: 0 },
            featured: { type: Boolean, default: false },
            trending: { type: Boolean, default: false },
            seasonal: { type: Boolean, default: false },
            createdBy: { type: mongoose_2.Types.ObjectId, ref: 'User' },
            designerName: String,
            designerCredit: String,
            license: { type: String, default: 'standard' },
            version: { type: Number, default: 1 },
        },
    }),
    __metadata("design:type", Object)
], Template.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adobe InDesign source information' }),
    (0, mongoose_1.Prop)({
        type: {
            indesignFile: String,
            indesignVersion: String,
            exportSettings: {
                format: { type: String, default: 'pdf' },
                quality: { type: String, default: 'high' },
                colorSpace: { type: String, default: 'cmyk' },
                resolution: { type: Number, default: 300 },
            },
            fonts: [String],
            linkedAssets: [String],
            lastExported: Date,
        },
    }),
    __metadata("design:type", Object)
], Template.prototype, "indesign", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template creation date' }),
    __metadata("design:type", Date)
], Template.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template last update date' }),
    __metadata("design:type", Date)
], Template.prototype, "updatedAt", void 0);
exports.Template = Template = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Template);
exports.TemplateSchema = mongoose_1.SchemaFactory.createForClass(Template);
exports.TemplateSchema.index({ productType: 1, category: 1, 'pricing.isActive': 1 });
exports.TemplateSchema.index({ style: 1, 'pricing.isActive': 1 });
exports.TemplateSchema.index({ 'metadata.featured': 1, 'pricing.isActive': 1 });
exports.TemplateSchema.index({ 'metadata.trending': 1, 'pricing.isActive': 1 });
exports.TemplateSchema.index({ 'metadata.usageCount': -1, 'pricing.isActive': 1 });
exports.TemplateSchema.index({ 'metadata.rating': -1, 'pricing.isActive': 1 });
exports.TemplateSchema.index({ 'dimensions.orientation': 1, productType: 1 });
exports.TemplateSchema.index({ 'metadata.tags': 1, 'pricing.isActive': 1 });
//# sourceMappingURL=template.schema.js.map