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
exports.LayoutTemplateSchema = exports.LayoutTemplate = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
const product_size_schema_1 = require("../../common/schemas/product-size.schema");
let LayoutTemplate = class LayoutTemplate {
    name;
    description;
    productType;
    category;
    tags;
    imageCount;
    preferredOrientation;
    imageSlots;
    textSlots;
    background;
    previewUrl;
    thumbnailUrl;
    isActive;
    isPremium;
    difficulty;
    usageCount;
    averageRating;
    metadata;
};
exports.LayoutTemplate = LayoutTemplate;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: product_size_schema_1.ProductType, description: 'Product type this template is for' }),
    (0, mongoose_1.Prop)({ required: true, enum: product_size_schema_1.ProductType }),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template category' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template tags for filtering' }),
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], LayoutTemplate.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of image slots' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LayoutTemplate.prototype, "imageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preferred orientation for images' }),
    (0, mongoose_1.Prop)({ enum: ['portrait', 'landscape', 'square', 'mixed'] }),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "preferredOrientation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image slots configuration' }),
    (0, mongoose_1.Prop)({ type: [Object], required: true }),
    __metadata("design:type", Array)
], LayoutTemplate.prototype, "imageSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Text slots configuration' }),
    (0, mongoose_1.Prop)({ type: [Object] }),
    __metadata("design:type", Array)
], LayoutTemplate.prototype, "textSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Background configuration' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], LayoutTemplate.prototype, "background", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template preview image URL' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "previewUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template thumbnail URL' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether template is active' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], LayoutTemplate.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether template is premium' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], LayoutTemplate.prototype, "isPremium", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template difficulty level' }),
    (0, mongoose_1.Prop)({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }),
    __metadata("design:type", String)
], LayoutTemplate.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Usage count for analytics' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LayoutTemplate.prototype, "usageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average rating' }),
    (0, mongoose_1.Prop)({ min: 0, max: 5 }),
    __metadata("design:type", Number)
], LayoutTemplate.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            createdBy: String,
            version: { type: String, default: '1.0' },
            compatibleSizes: [String],
            estimatedTime: Number,
        },
    }),
    __metadata("design:type", Object)
], LayoutTemplate.prototype, "metadata", void 0);
exports.LayoutTemplate = LayoutTemplate = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LayoutTemplate);
exports.LayoutTemplateSchema = mongoose_1.SchemaFactory.createForClass(LayoutTemplate);
//# sourceMappingURL=layout-template.schema.js.map