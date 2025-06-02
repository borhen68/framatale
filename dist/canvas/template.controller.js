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
exports.TemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const template_manager_service_1 = require("./template-manager.service");
const template_schema_1 = require("./schemas/template.schema");
const canvas_schema_1 = require("./schemas/canvas.schema");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let TemplateController = class TemplateController {
    templateManager;
    constructor(templateManager) {
        this.templateManager = templateManager;
    }
    async getTemplatesForProduct(productType, width, height, orientation, category, style, featured) {
        const filters = {};
        if (category)
            filters.category = category;
        if (style)
            filters.style = style;
        if (featured)
            filters.featured = featured;
        return this.templateManager.getTemplatesForProduct(productType, { width: Number(width), height: Number(height), orientation }, filters);
    }
    async getFeaturedTemplates(productType) {
        return this.templateManager.getFeaturedTemplates(productType);
    }
    async getTrendingTemplates(productType) {
        return this.templateManager.getTrendingTemplates(productType);
    }
    async getSeasonalTemplates(productType) {
        return this.templateManager.getSeasonalTemplates(productType);
    }
    async searchTemplates(searchTerm, productType, category, style) {
        const filters = {};
        if (category)
            filters.category = category;
        if (style)
            filters.style = style;
        return this.templateManager.searchTemplates(searchTerm, productType, filters);
    }
    async getTemplate(templateId) {
        return this.templateManager.getTemplate(templateId);
    }
    async rateTemplate(templateId, ratingData) {
        return this.templateManager.rateTemplate(templateId, ratingData.rating);
    }
    async createTemplate(request) {
        return this.templateManager.createTemplate(request);
    }
    async createFromInDesign(indesignData) {
        return this.templateManager.createPhotoBookTemplateFromInDesign(indesignData);
    }
    async createWeddingTemplate() {
        const template = await this.templateManager.createTemplate({
            name: 'Elegant Wedding Photo Book',
            description: 'Beautiful wedding photo book template with elegant typography and romantic layouts',
            productType: canvas_schema_1.ProductType.PHOTO_BOOK,
            category: template_schema_1.TemplateCategory.WEDDING,
            style: template_schema_1.TemplateStyle.ELEGANT,
            dimensions: {
                width: 2400,
                height: 2400,
                orientation: 'portrait',
                pageCount: 20,
            },
            canvases: [
                {
                    canvasType: 'COVER',
                    name: 'Front Cover',
                    order: 1,
                    dimensions: {
                        width: 2400,
                        height: 2400,
                        unit: 'px',
                        dpi: 300,
                        bleed: 3,
                        safeZone: 5,
                        orientation: 'portrait',
                    },
                    background: {
                        type: 'color',
                        color: '#f8f8f8',
                    },
                    elements: [
                        {
                            id: 'cover_image_placeholder',
                            type: 'IMAGE',
                            name: 'Main Photo',
                            position: { x: 200, y: 200, z: 1 },
                            size: { width: 2000, height: 1500 },
                            rotation: 0,
                            opacity: 1,
                            visible: true,
                            locked: false,
                            isPlaceholder: true,
                            placeholderType: 'image',
                            placeholderText: 'Add your wedding photo here',
                        },
                        {
                            id: 'cover_title_placeholder',
                            type: 'TEXT',
                            name: 'Wedding Title',
                            position: { x: 200, y: 1800, z: 2 },
                            size: { width: 2000, height: 200 },
                            rotation: 0,
                            opacity: 1,
                            visible: true,
                            locked: false,
                            isPlaceholder: true,
                            placeholderType: 'text',
                            placeholderText: 'Your Names Here',
                            text: {
                                content: 'Your Names Here',
                                fontFamily: 'Playfair Display',
                                fontSize: 48,
                                fontWeight: 'normal',
                                fontStyle: 'normal',
                                color: '#2c3e50',
                                align: 'center',
                                lineHeight: 1.2,
                                letterSpacing: 2,
                                textDecoration: 'none',
                            },
                        },
                    ],
                },
                {
                    canvasType: 'SPREAD',
                    name: 'Pages 1-2',
                    order: 2,
                    dimensions: {
                        width: 4800,
                        height: 2400,
                        unit: 'px',
                        dpi: 300,
                        bleed: 3,
                        safeZone: 5,
                        orientation: 'landscape',
                    },
                    background: {
                        type: 'color',
                        color: '#ffffff',
                    },
                    elements: [
                        {
                            id: 'spread_image_1',
                            type: 'IMAGE',
                            name: 'Photo 1',
                            position: { x: 100, y: 100, z: 1 },
                            size: { width: 1000, height: 800 },
                            rotation: 0,
                            opacity: 1,
                            visible: true,
                            locked: false,
                            isPlaceholder: true,
                            placeholderType: 'image',
                        },
                        {
                            id: 'spread_image_2',
                            type: 'IMAGE',
                            name: 'Photo 2',
                            position: { x: 2500, y: 100, z: 1 },
                            size: { width: 1000, height: 800 },
                            rotation: 0,
                            opacity: 1,
                            visible: true,
                            locked: false,
                            isPlaceholder: true,
                            placeholderType: 'image',
                        },
                    ],
                },
            ],
            previews: {
                thumbnail: '/templates/wedding-elegant/thumbnail.jpg',
                preview: '/templates/wedding-elegant/preview.jpg',
                fullPreview: '/templates/wedding-elegant/full-preview.jpg',
                mockup: '/templates/wedding-elegant/mockup.jpg',
            },
            pricing: {
                isPremium: false,
                price: 0,
            },
            metadata: {
                tags: ['wedding', 'elegant', 'romantic', 'classic'],
                colors: ['#f8f8f8', '#2c3e50', '#ffffff'],
                difficulty: 'easy',
                designerName: 'Frametale Design Team',
            },
            indesign: {
                indesignFile: '/indesign/wedding-elegant.indd',
                indesignVersion: 'CC 2024',
                fonts: ['Playfair Display', 'Source Sans Pro'],
            },
        });
        return {
            message: 'Wedding photo book template created successfully',
            template,
            usage: [
                'This template will show when customers select 8x8 photo book size',
                'Customers can replace placeholder images with their wedding photos',
                'Text placeholders can be customized with their names and details',
                'Template maintains elegant design while allowing personalization',
            ],
        };
    }
    async get8x8Templates() {
        const templates = await this.templateManager.getTemplatesForProduct(canvas_schema_1.ProductType.PHOTO_BOOK, { width: 2400, height: 2400, orientation: 'portrait' });
        return {
            message: 'Templates for 8x8 photo book',
            productInfo: {
                productType: 'PHOTO_BOOK',
                size: '8x8 inches',
                dimensions: { width: 2400, height: 2400 },
                dpi: 300,
                orientation: 'portrait',
            },
            templates: templates.templates,
            explanation: [
                'These templates are specifically designed for 8x8 photo books',
                'All templates match the selected dimensions (2400x2400px at 300 DPI)',
                'Templates include placeholders for easy customization',
                'Customers can choose from different categories and styles',
                `Found ${templates.totalCount} templates available`,
            ],
        };
    }
};
exports.TemplateController = TemplateController;
__decorate([
    (0, common_1.Get)('product/:productType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get templates for specific product and size' }),
    (0, swagger_1.ApiQuery)({ name: 'width', type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'height', type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'orientation', enum: ['portrait', 'landscape'] }),
    (0, swagger_1.ApiQuery)({ name: 'category', enum: template_schema_1.TemplateCategory, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'style', enum: template_schema_1.TemplateStyle, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'featured', type: 'boolean', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Templates retrieved successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __param(1, (0, common_1.Query)('width')),
    __param(2, (0, common_1.Query)('height')),
    __param(3, (0, common_1.Query)('orientation')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('style')),
    __param(6, (0, common_1.Query)('featured')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getTemplatesForProduct", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured templates' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: canvas_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured templates retrieved successfully' }),
    __param(0, (0, common_1.Query)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getFeaturedTemplates", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending templates' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: canvas_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trending templates retrieved successfully' }),
    __param(0, (0, common_1.Query)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getTrendingTemplates", null);
__decorate([
    (0, common_1.Get)('seasonal'),
    (0, swagger_1.ApiOperation)({ summary: 'Get seasonal templates' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: canvas_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Seasonal templates retrieved successfully' }),
    __param(0, (0, common_1.Query)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getSeasonalTemplates", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search templates' }),
    (0, swagger_1.ApiQuery)({ name: 'q', description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', enum: canvas_schema_1.ProductType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', enum: template_schema_1.TemplateCategory, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'style', enum: template_schema_1.TemplateStyle, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved successfully' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('productType')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('style')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "searchTemplates", null);
__decorate([
    (0, common_1.Get)(':templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template details retrieved successfully' }),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)(':templateId/rate'),
    (0, swagger_1.ApiOperation)({ summary: 'Rate a template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template rated successfully' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "rateTemplate", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new template (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Post)('create-from-indesign'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create template from Adobe InDesign export (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created from InDesign successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "createFromInDesign", null);
__decorate([
    (0, common_1.Post)('examples/wedding-photo-book'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Example: Create wedding photo book template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wedding template created successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "createWeddingTemplate", null);
__decorate([
    (0, common_1.Get)('examples/8x8-templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Example: Get templates for 8x8 photo book' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Templates for 8x8 photo book retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "get8x8Templates", null);
exports.TemplateController = TemplateController = __decorate([
    (0, swagger_1.ApiTags)('Template Management'),
    (0, common_1.Controller)('templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [template_manager_service_1.TemplateManagerService])
], TemplateController);
//# sourceMappingURL=template.controller.js.map