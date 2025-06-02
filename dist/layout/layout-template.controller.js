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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const layout_template_service_1 = require("./layout-template.service");
const create_template_dto_1 = require("./dto/create-template.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const product_size_schema_1 = require("../common/schemas/product-size.schema");
let LayoutTemplateController = class LayoutTemplateController {
    templateService;
    constructor(templateService) {
        this.templateService = templateService;
    }
    async create(createTemplateDto) {
        return this.templateService.create(createTemplateDto);
    }
    async findAll(productType, category, tags, imageCount, minImageCount, maxImageCount, preferredOrientation, difficulty, isPremium) {
        const filter = {
            productType,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
            imageCount,
            minImageCount,
            maxImageCount,
            preferredOrientation,
            difficulty,
            isPremium,
            isActive: true,
        };
        return this.templateService.findAll(filter);
    }
    async findPopular(limit, productType) {
        return this.templateService.findPopular(limit, productType);
    }
    async findRecommended(imageCount, preferredOrientation, productType, limit) {
        return this.templateService.findRecommended(imageCount, preferredOrientation, productType, limit);
    }
    async getCategories(productType) {
        return this.templateService.getCategories(productType);
    }
    async getTags(productType) {
        return this.templateService.getTags(productType);
    }
    async getStatistics() {
        return this.templateService.getStatistics();
    }
    async findById(id) {
        return this.templateService.findById(id);
    }
    async update(id, updateData) {
        return this.templateService.update(id, updateData);
    }
    async incrementUsage(id) {
        await this.templateService.incrementUsage(id);
        return { message: 'Usage count updated successfully' };
    }
    async updateRating(id, rating) {
        return this.templateService.updateRating(id, rating);
    }
    async delete(id) {
        await this.templateService.delete(id);
        return { message: 'Template deleted successfully' };
    }
};
exports.LayoutTemplateController = LayoutTemplateController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new layout template (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all templates with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: product_size_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', type: 'string', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tags', type: 'string', required: false, description: 'Comma-separated tags' }),
    (0, swagger_1.ApiQuery)({ name: 'imageCount', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'minImageCount', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxImageCount', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'preferredOrientation', enum: ['portrait', 'landscape', 'square', 'mixed'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'difficulty', enum: ['beginner', 'intermediate', 'advanced'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isPremium', type: 'boolean', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Templates retrieved successfully' }),
    __param(0, (0, common_1.Query)('productType')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('tags')),
    __param(3, (0, common_1.Query)('imageCount')),
    __param(4, (0, common_1.Query)('minImageCount')),
    __param(5, (0, common_1.Query)('maxImageCount')),
    __param(6, (0, common_1.Query)('preferredOrientation')),
    __param(7, (0, common_1.Query)('difficulty')),
    __param(8, (0, common_1.Query)('isPremium')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Number, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('popular'),
    (0, swagger_1.ApiOperation)({ summary: 'Get popular templates' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: product_size_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Popular templates retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "findPopular", null);
__decorate([
    (0, common_1.Get)('recommended'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recommended templates based on criteria' }),
    (0, swagger_1.ApiQuery)({ name: 'imageCount', type: 'number', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'preferredOrientation', enum: ['portrait', 'landscape', 'square', 'mixed'], required: true }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: product_size_schema_1.ProductType, required: true }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommended templates retrieved successfully' }),
    __param(0, (0, common_1.Query)('imageCount')),
    __param(1, (0, common_1.Query)('preferredOrientation')),
    __param(2, (0, common_1.Query)('productType')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Number]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "findRecommended", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all template categories' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: product_size_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categories retrieved successfully' }),
    __param(0, (0, common_1.Query)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all template tags' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: product_size_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tags retrieved successfully' }),
    __param(0, (0, common_1.Query)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update template (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Increment template usage count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usage count updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "incrementUsage", null);
__decorate([
    (0, common_1.Put)(':id/rating'),
    (0, swagger_1.ApiOperation)({ summary: 'Update template rating' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rating updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('rating')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "updateRating", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete template (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LayoutTemplateController.prototype, "delete", null);
exports.LayoutTemplateController = LayoutTemplateController = __decorate([
    (0, swagger_1.ApiTags)('Layout Templates'),
    (0, common_1.Controller)('templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [layout_template_service_1.LayoutTemplateService])
], LayoutTemplateController);
//# sourceMappingURL=layout-template.controller.js.map