import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LayoutTemplate, LayoutTemplateDocument } from './schemas/layout-template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { ProductType } from '../common/schemas/product-size.schema';

export interface TemplateFilter {
  productType?: ProductType;
  category?: string;
  tags?: string[];
  imageCount?: number;
  minImageCount?: number;
  maxImageCount?: number;
  preferredOrientation?: 'portrait' | 'landscape' | 'square' | 'mixed';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isPremium?: boolean;
  isActive?: boolean;
}

@Injectable()
export class LayoutTemplateService {
  constructor(
    @InjectModel(LayoutTemplate.name) private templateModel: Model<LayoutTemplateDocument>,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<LayoutTemplate> {
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

  async findAll(filter: TemplateFilter = {}): Promise<LayoutTemplate[]> {
    const query: any = {};

    if (filter.productType) query.productType = filter.productType;
    if (filter.category) query.category = filter.category;
    if (filter.tags && filter.tags.length > 0) query.tags = { $in: filter.tags };
    if (filter.imageCount) query.imageCount = filter.imageCount;
    if (filter.minImageCount || filter.maxImageCount) {
      query.imageCount = {};
      if (filter.minImageCount) query.imageCount.$gte = filter.minImageCount;
      if (filter.maxImageCount) query.imageCount.$lte = filter.maxImageCount;
    }
    if (filter.preferredOrientation) query.preferredOrientation = filter.preferredOrientation;
    if (filter.difficulty) query.difficulty = filter.difficulty;
    if (filter.isPremium !== undefined) query.isPremium = filter.isPremium;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;

    return this.templateModel
      .find(query)
      .sort({ usageCount: -1, averageRating: -1, createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<LayoutTemplateDocument> {
    const template = await this.templateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async findByProductType(productType: ProductType): Promise<LayoutTemplate[]> {
    return this.templateModel
      .find({ productType, isActive: true })
      .sort({ usageCount: -1, averageRating: -1 })
      .exec();
  }

  async findByImageCount(imageCount: number, productType?: ProductType): Promise<LayoutTemplate[]> {
    const query: any = { imageCount, isActive: true };
    if (productType) query.productType = productType;

    return this.templateModel
      .find(query)
      .sort({ usageCount: -1, averageRating: -1 })
      .exec();
  }

  async findByCategory(category: string, productType?: ProductType): Promise<LayoutTemplate[]> {
    const query: any = { category, isActive: true };
    if (productType) query.productType = productType;

    return this.templateModel
      .find(query)
      .sort({ usageCount: -1, averageRating: -1 })
      .exec();
  }

  async findPopular(limit: number = 10, productType?: ProductType): Promise<LayoutTemplate[]> {
    const query: any = { isActive: true };
    if (productType) query.productType = productType;

    return this.templateModel
      .find(query)
      .sort({ usageCount: -1, averageRating: -1 })
      .limit(limit)
      .exec();
  }

  async findRecommended(
    imageCount: number,
    preferredOrientation: 'portrait' | 'landscape' | 'square' | 'mixed',
    productType: ProductType,
    limit: number = 5,
  ): Promise<LayoutTemplate[]> {
    // Find templates that match the criteria with some flexibility
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

    // If not enough exact matches, find similar templates
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

  async update(id: string, updateData: Partial<LayoutTemplate>): Promise<LayoutTemplate> {
    const template = await this.templateModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async incrementUsage(id: string): Promise<void> {
    await this.templateModel.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } }
    ).exec();
  }

  async updateRating(id: string, newRating: number): Promise<LayoutTemplate> {
    const template = await this.findById(id);
    
    // Simple rating update - in production, you might want to track individual ratings
    const currentRating = template.averageRating || 0;
    const usageCount = template.usageCount || 1;
    
    // Weighted average calculation
    const updatedRating = ((currentRating * usageCount) + newRating) / (usageCount + 1);
    
    return this.update(id, { averageRating: Math.round(updatedRating * 10) / 10 });
  }

  async delete(id: string): Promise<void> {
    const result = await this.templateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Template not found');
    }
  }

  async getCategories(productType?: ProductType): Promise<string[]> {
    const query: any = { isActive: true };
    if (productType) query.productType = productType;

    const categories = await this.templateModel.distinct('category', query).exec();
    return categories.sort();
  }

  async getTags(productType?: ProductType): Promise<string[]> {
    const query: any = { isActive: true };
    if (productType) query.productType = productType;

    const tags = await this.templateModel.distinct('tags', query).exec();
    return tags.sort();
  }

  async getStatistics(): Promise<{
    totalTemplates: number;
    templatesByProductType: Record<string, number>;
    templatesByCategory: Record<string, number>;
    averageImageCount: number;
    mostPopularTemplate: LayoutTemplate | null;
  }> {
    const totalTemplates = await this.templateModel.countDocuments({ isActive: true }).exec();

    // Templates by product type
    const productTypeAgg = await this.templateModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$productType', count: { $sum: 1 } } }
    ]).exec();
    
    const templatesByProductType = productTypeAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Templates by category
    const categoryAgg = await this.templateModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).exec();
    
    const templatesByCategory = categoryAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Average image count
    const avgImageCountAgg = await this.templateModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgImageCount: { $avg: '$imageCount' } } }
    ]).exec();
    
    const averageImageCount = avgImageCountAgg[0]?.avgImageCount || 0;

    // Most popular template
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
}
