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
exports.LayoutTemplateService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const layout_template_schema_1 = require("./schemas/layout-template.schema");
let LayoutTemplateService = class LayoutTemplateService {
    templateModel;
    constructor(templateModel) {
        this.templateModel = templateModel;
    }
    async create(createTemplateDto) {
        const template = new this.templateModel({
            ...createTemplateDto,
            tags: createTemplateDto.tags || [],
            preferredOrientation: createTemplateDto.preferredOrientation || 'mixed',
            isPremium: createTemplateDto.isPremium || false,
            difficulty: createTemplateDto.difficulty || 'beginner',
            textSlots: createTemplateDto.textSlots || [],
            metadata: {
                version: '1.0',
                compatibleSizes: [],
            },
        });
        return template.save();
    }
    async findAll(filter = {}) {
        const query = {};
        if (filter.productType)
            query.productType = filter.productType;
        if (filter.category)
            query.category = filter.category;
        if (filter.tags && filter.tags.length > 0)
            query.tags = { $in: filter.tags };
        if (filter.imageCount)
            query.imageCount = filter.imageCount;
        if (filter.minImageCount || filter.maxImageCount) {
            query.imageCount = {};
            if (filter.minImageCount)
                query.imageCount.$gte = filter.minImageCount;
            if (filter.maxImageCount)
                query.imageCount.$lte = filter.maxImageCount;
        }
        if (filter.preferredOrientation)
            query.preferredOrientation = filter.preferredOrientation;
        if (filter.difficulty)
            query.difficulty = filter.difficulty;
        if (filter.isPremium !== undefined)
            query.isPremium = filter.isPremium;
        if (filter.isActive !== undefined)
            query.isActive = filter.isActive;
        return this.templateModel
            .find(query)
            .sort({ usageCount: -1, averageRating: -1, createdAt: -1 })
            .exec();
    }
    async findById(id) {
        const template = await this.templateModel.findById(id).exec();
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        return template;
    }
    async findByProductType(productType) {
        return this.templateModel
            .find({ productType, isActive: true })
            .sort({ usageCount: -1, averageRating: -1 })
            .exec();
    }
    async findByImageCount(imageCount, productType) {
        const query = { imageCount, isActive: true };
        if (productType)
            query.productType = productType;
        return this.templateModel
            .find(query)
            .sort({ usageCount: -1, averageRating: -1 })
            .exec();
    }
    async findByCategory(category, productType) {
        const query = { category, isActive: true };
        if (productType)
            query.productType = productType;
        return this.templateModel
            .find(query)
            .sort({ usageCount: -1, averageRating: -1 })
            .exec();
    }
    async findPopular(limit = 10, productType) {
        const query = { isActive: true };
        if (productType)
            query.productType = productType;
        return this.templateModel
            .find(query)
            .sort({ usageCount: -1, averageRating: -1 })
            .limit(limit)
            .exec();
    }
    async findRecommended(imageCount, preferredOrientation, productType, limit = 5) {
        const exactMatches = await this.templateModel
            .find({
            productType,
            imageCount,
            $or: [
                { preferredOrientation },
                { preferredOrientation: 'mixed' }
            ],
            isActive: true,
        })
            .sort({ usageCount: -1, averageRating: -1 })
            .limit(limit)
            .exec();
        if (exactMatches.length >= limit) {
            return exactMatches;
        }
        const similarMatches = await this.templateModel
            .find({
            productType,
            imageCount: { $gte: Math.max(1, imageCount - 2), $lte: imageCount + 2 },
            isActive: true,
            _id: { $nin: exactMatches.map(t => t._id) }
        })
            .sort({ usageCount: -1, averageRating: -1 })
            .limit(limit - exactMatches.length)
            .exec();
        return [...exactMatches, ...similarMatches];
    }
    async update(id, updateData) {
        const template = await this.templateModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        return template;
    }
    async incrementUsage(id) {
        await this.templateModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }).exec();
    }
    async updateRating(id, newRating) {
        const template = await this.findById(id);
        const currentRating = template.averageRating || 0;
        const usageCount = template.usageCount || 1;
        const updatedRating = ((currentRating * usageCount) + newRating) / (usageCount + 1);
        return this.update(id, { averageRating: Math.round(updatedRating * 10) / 10 });
    }
    async delete(id) {
        const result = await this.templateModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Template not found');
        }
    }
    async getCategories(productType) {
        const query = { isActive: true };
        if (productType)
            query.productType = productType;
        const categories = await this.templateModel.distinct('category', query).exec();
        return categories.sort();
    }
    async getTags(productType) {
        const query = { isActive: true };
        if (productType)
            query.productType = productType;
        const tags = await this.templateModel.distinct('tags', query).exec();
        return tags.sort();
    }
    async getStatistics() {
        const totalTemplates = await this.templateModel.countDocuments({ isActive: true }).exec();
        const productTypeAgg = await this.templateModel.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$productType', count: { $sum: 1 } } }
        ]).exec();
        const templatesByProductType = productTypeAgg.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        const categoryAgg = await this.templateModel.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).exec();
        const templatesByCategory = categoryAgg.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        const avgImageCountAgg = await this.templateModel.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, avgImageCount: { $avg: '$imageCount' } } }
        ]).exec();
        const averageImageCount = avgImageCountAgg[0]?.avgImageCount || 0;
        const mostPopularTemplate = await this.templateModel
            .findOne({ isActive: true })
            .sort({ usageCount: -1, averageRating: -1 })
            .exec();
        return {
            totalTemplates,
            templatesByProductType,
            templatesByCategory,
            averageImageCount: Math.round(averageImageCount * 10) / 10,
            mostPopularTemplate,
        };
    }
};
exports.LayoutTemplateService = LayoutTemplateService;
exports.LayoutTemplateService = LayoutTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(layout_template_schema_1.LayoutTemplate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LayoutTemplateService);
//# sourceMappingURL=layout-template.service.js.map