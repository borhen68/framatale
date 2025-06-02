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
exports.TemplateManagerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const template_schema_1 = require("./schemas/template.schema");
const canvas_schema_1 = require("./schemas/canvas.schema");
let TemplateManagerService = class TemplateManagerService {
    templateModel;
    constructor(templateModel) {
        this.templateModel = templateModel;
    }
    async createTemplate(request) {
        const template = new this.templateModel({
            name: request.name,
            description: request.description,
            productType: request.productType,
            category: request.category,
            style: request.style,
            dimensions: {
                width: request.dimensions.width,
                height: request.dimensions.height,
                unit: 'px',
                dpi: 300,
                orientation: request.dimensions.orientation,
                pageCount: request.dimensions.pageCount || 1,
                spreadCount: request.productType === canvas_schema_1.ProductType.PHOTO_BOOK ?
                    Math.ceil((request.dimensions.pageCount || 1) / 2) : 0,
            },
            canvases: request.canvases,
            previews: request.previews,
            pricing: {
                isPremium: request.pricing?.isPremium || false,
                price: request.pricing?.price || 0,
                isActive: true,
                isPublic: true,
                requiredSubscription: request.pricing?.isPremium ? 'pro' : 'free',
            },
            metadata: {
                tags: request.metadata?.tags || [],
                colors: request.metadata?.colors || [],
                difficulty: request.metadata?.difficulty || 'easy',
                estimatedTime: this.calculateEstimatedTime(request.productType, request.dimensions.pageCount),
                usageCount: 0,
                rating: 0,
                ratingCount: 0,
                featured: false,
                trending: false,
                seasonal: this.isSeasonalTemplate(request.category),
                designerName: request.metadata?.designerName,
                license: 'standard',
                version: 1,
            },
            indesign: request.indesign,
        });
        return template.save();
    }
    async getTemplatesForProduct(productType, dimensions, filters) {
        const query = {
            productType,
            'dimensions.orientation': dimensions.orientation,
            'pricing.isActive': true,
            'pricing.isPublic': true,
        };
        if (filters) {
            if (filters.category)
                query.category = filters.category;
            if (filters.style)
                query.style = filters.style;
            if (filters.isPremium !== undefined)
                query['pricing.isPremium'] = filters.isPremium;
            if (filters.featured)
                query['metadata.featured'] = true;
            if (filters.trending)
                query['metadata.trending'] = true;
            if (filters.difficulty)
                query['metadata.difficulty'] = filters.difficulty;
            if (filters.minRating)
                query['metadata.rating'] = { $gte: filters.minRating };
            if (filters.tags && filters.tags.length > 0) {
                query['metadata.tags'] = { $in: filters.tags };
            }
            if (filters.colors && filters.colors.length > 0) {
                query['metadata.colors'] = { $in: filters.colors };
            }
        }
        const templates = await this.templateModel
            .find(query)
            .sort({
            'metadata.featured': -1,
            'metadata.trending': -1,
            'metadata.usageCount': -1,
            'metadata.rating': -1,
            createdAt: -1,
        })
            .exec();
        const [categories, styles] = await Promise.all([
            this.templateModel.distinct('category', { productType, 'pricing.isActive': true }),
            this.templateModel.distinct('style', { productType, 'pricing.isActive': true }),
        ]);
        return {
            templates,
            categories,
            styles,
            totalCount: templates.length,
        };
    }
    async getFeaturedTemplates(productType) {
        const query = {
            'metadata.featured': true,
            'pricing.isActive': true,
            'pricing.isPublic': true,
        };
        if (productType) {
            query.productType = productType;
        }
        return this.templateModel
            .find(query)
            .sort({ 'metadata.usageCount': -1, 'metadata.rating': -1 })
            .limit(12)
            .exec();
    }
    async getTrendingTemplates(productType) {
        const query = {
            'metadata.trending': true,
            'pricing.isActive': true,
            'pricing.isPublic': true,
        };
        if (productType) {
            query.productType = productType;
        }
        return this.templateModel
            .find(query)
            .sort({ 'metadata.usageCount': -1, createdAt: -1 })
            .limit(12)
            .exec();
    }
    async getSeasonalTemplates(productType) {
        const currentMonth = new Date().getMonth() + 1;
        const seasonalCategories = this.getSeasonalCategories(currentMonth);
        const query = {
            category: { $in: seasonalCategories },
            'pricing.isActive': true,
            'pricing.isPublic': true,
        };
        if (productType) {
            query.productType = productType;
        }
        return this.templateModel
            .find(query)
            .sort({ 'metadata.usageCount': -1, 'metadata.rating': -1 })
            .limit(12)
            .exec();
    }
    async searchTemplates(searchTerm, productType, filters) {
        const query = {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { 'metadata.tags': { $regex: searchTerm, $options: 'i' } },
            ],
            'pricing.isActive': true,
            'pricing.isPublic': true,
        };
        if (productType) {
            query.productType = productType;
        }
        if (filters) {
            Object.assign(query, this.buildFilterQuery(filters));
        }
        return this.templateModel
            .find(query)
            .sort({ 'metadata.usageCount': -1, 'metadata.rating': -1 })
            .exec();
    }
    async getTemplate(templateId) {
        const template = await this.templateModel.findById(templateId).exec();
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        template.metadata.usageCount += 1;
        await template.save();
        return template;
    }
    async rateTemplate(templateId, rating) {
        const template = await this.templateModel.findById(templateId).exec();
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const totalRating = template.metadata.rating * template.metadata.ratingCount + rating;
        template.metadata.ratingCount += 1;
        template.metadata.rating = totalRating / template.metadata.ratingCount;
        return template.save();
    }
    async createPhotoBookTemplateFromInDesign(indesignData) {
        return this.createTemplate({
            name: indesignData.name,
            description: `Beautiful ${indesignData.category.toLowerCase()} photo book template`,
            productType: canvas_schema_1.ProductType.PHOTO_BOOK,
            category: indesignData.category,
            style: indesignData.style,
            dimensions: {
                width: 2400,
                height: 2400,
                orientation: 'portrait',
                pageCount: 20,
            },
            canvases: indesignData.exportedCanvases,
            previews: indesignData.previews,
            pricing: {
                isPremium: indesignData.style === template_schema_1.TemplateStyle.ELEGANT || indesignData.style === template_schema_1.TemplateStyle.ARTISTIC,
                price: 0,
            },
            metadata: {
                tags: [indesignData.category.toLowerCase(), indesignData.style.toLowerCase(), 'photo book'],
                difficulty: 'easy',
                designerName: 'Frametale Design Team',
            },
            indesign: {
                indesignFile: indesignData.indesignFile,
                indesignVersion: 'CC 2024',
                fonts: ['Arial', 'Helvetica', 'Times New Roman'],
            },
        });
    }
    calculateEstimatedTime(productType, pageCount) {
        const baseTime = {
            [canvas_schema_1.ProductType.PHOTO_BOOK]: 30,
            [canvas_schema_1.ProductType.GREETING_CARD]: 10,
            [canvas_schema_1.ProductType.BUSINESS_CARD]: 5,
            [canvas_schema_1.ProductType.CALENDAR]: 45,
            [canvas_schema_1.ProductType.POSTER]: 15,
            [canvas_schema_1.ProductType.FLYER]: 10,
        };
        let time = baseTime[productType] || 15;
        if (pageCount && pageCount > 1) {
            time += (pageCount - 1) * 2;
        }
        return time;
    }
    isSeasonalTemplate(category) {
        const seasonalCategories = [
            template_schema_1.TemplateCategory.HOLIDAY,
            template_schema_1.TemplateCategory.WEDDING,
            template_schema_1.TemplateCategory.GRADUATION,
            template_schema_1.TemplateCategory.SEASONAL,
        ];
        return seasonalCategories.includes(category);
    }
    getSeasonalCategories(month) {
        if (month >= 11 || month <= 1) {
            return [template_schema_1.TemplateCategory.HOLIDAY, template_schema_1.TemplateCategory.SEASONAL];
        }
        else if (month >= 2 && month <= 4) {
            return [template_schema_1.TemplateCategory.WEDDING, template_schema_1.TemplateCategory.SEASONAL];
        }
        else if (month >= 5 && month <= 6) {
            return [template_schema_1.TemplateCategory.GRADUATION, template_schema_1.TemplateCategory.WEDDING];
        }
        else if (month >= 7 && month <= 8) {
            return [template_schema_1.TemplateCategory.TRAVEL, template_schema_1.TemplateCategory.FAMILY];
        }
        else {
            return [template_schema_1.TemplateCategory.FAMILY, template_schema_1.TemplateCategory.SEASONAL];
        }
    }
    buildFilterQuery(filters) {
        const query = {};
        if (filters.category)
            query.category = filters.category;
        if (filters.style)
            query.style = filters.style;
        if (filters.isPremium !== undefined)
            query['pricing.isPremium'] = filters.isPremium;
        if (filters.featured)
            query['metadata.featured'] = true;
        if (filters.trending)
            query['metadata.trending'] = true;
        if (filters.difficulty)
            query['metadata.difficulty'] = filters.difficulty;
        if (filters.minRating)
            query['metadata.rating'] = { $gte: filters.minRating };
        return query;
    }
};
exports.TemplateManagerService = TemplateManagerService;
exports.TemplateManagerService = TemplateManagerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(template_schema_1.Template.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TemplateManagerService);
//# sourceMappingURL=template-manager.service.js.map