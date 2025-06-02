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
exports.CreateTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const product_size_schema_1 = require("../../common/schemas/product-size.schema");
class CreateTemplateDto {
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
    isPremium;
    difficulty;
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: product_size_schema_1.ProductType, description: 'Product type' }),
    (0, class_validator_1.IsEnum)(product_size_schema_1.ProductType),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template category' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template tags', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of image slots' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTemplateDto.prototype, "imageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preferred orientation', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['portrait', 'landscape', 'square', 'mixed']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "preferredOrientation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image slots configuration' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "imageSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Text slots configuration', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "textSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Background configuration', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Object)
], CreateTemplateDto.prototype, "background", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether template is premium', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateDto.prototype, "isPremium", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template difficulty', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['beginner', 'intermediate', 'advanced']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "difficulty", void 0);
//# sourceMappingURL=create-template.dto.js.map