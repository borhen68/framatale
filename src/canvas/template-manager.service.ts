import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument, TemplateCategory, TemplateStyle } from './schemas/template.schema';
import { ProductType, CanvasType } from './schemas/canvas.schema';

export interface TemplateSearchFilters {
  productType?: ProductType;
  category?: TemplateCategory;
  style?: TemplateStyle;
  orientation?: 'portrait' | 'landscape';
  isPremium?: boolean;
  featured?: boolean;
  trending?: boolean;
  tags?: string[];
  colors?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  minRating?: number;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  productType: ProductType;
  category: TemplateCategory;
  style: TemplateStyle;
  dimensions: {
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
    pageCount?: number;
  };
  canvases: any[];
  previews: {
    thumbnail: string;
    preview: string;
    fullPreview?: string;
    mockup?: string;
  };
  pricing?: {
    isPremium?: boolean;
    price?: number;
  };
  metadata?: {
    tags?: string[];
    colors?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    designerName?: string;
  };
  indesign?: {
    indesignFile: string;
    indesignVersion: string;
    fonts: string[];
  };
}

@Injectable()
export class TemplateManagerService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {}

  // Create template from Adobe InDesign export
  async createTemplate(request: CreateTemplateRequest): Promise<Template> {
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
        spreadCount: request.productType === ProductType.PHOTO_BOOK ? 
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

  // Get templates for product selection
  async getTemplatesForProduct(
    productType: ProductType,
    dimensions: { width: number; height: number; orientation: 'portrait' | 'landscape' },
    filters?: TemplateSearchFilters,
  ): Promise<{
    templates: Template[];
    categories: TemplateCategory[];
    styles: TemplateStyle[];
    totalCount: number;
  }> {
    // Build query
    const query: any = {
      productType,
      'dimensions.orientation': dimensions.orientation,
      'pricing.isActive': true,
      'pricing.isPublic': true,
    };

    // Apply filters
    if (filters) {
      if (filters.category) query.category = filters.category;
      if (filters.style) query.style = filters.style;
      if (filters.isPremium !== undefined) query['pricing.isPremium'] = filters.isPremium;
      if (filters.featured) query['metadata.featured'] = true;
      if (filters.trending) query['metadata.trending'] = true;
      if (filters.difficulty) query['metadata.difficulty'] = filters.difficulty;
      if (filters.minRating) query['metadata.rating'] = { $gte: filters.minRating };
      if (filters.tags && filters.tags.length > 0) {
        query['metadata.tags'] = { $in: filters.tags };
      }
      if (filters.colors && filters.colors.length > 0) {
        query['metadata.colors'] = { $in: filters.colors };
      }
    }

    // Get templates with sorting
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

    // Get available categories and styles for filters
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

  // Get featured templates
  async getFeaturedTemplates(productType?: ProductType): Promise<Template[]> {
    const query: any = {
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

  // Get trending templates
  async getTrendingTemplates(productType?: ProductType): Promise<Template[]> {
    const query: any = {
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

  // Get seasonal templates
  async getSeasonalTemplates(productType?: ProductType): Promise<Template[]> {
    const currentMonth = new Date().getMonth() + 1;
    const seasonalCategories = this.getSeasonalCategories(currentMonth);

    const query: any = {
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

  // Search templates
  async searchTemplates(
    searchTerm: string,
    productType?: ProductType,
    filters?: TemplateSearchFilters,
  ): Promise<Template[]> {
    const query: any = {
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

    // Apply additional filters
    if (filters) {
      Object.assign(query, this.buildFilterQuery(filters));
    }

    return this.templateModel
      .find(query)
      .sort({ 'metadata.usageCount': -1, 'metadata.rating': -1 })
      .exec();
  }

  // Get template by ID
  async getTemplate(templateId: string): Promise<Template> {
    const template = await this.templateModel.findById(templateId).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Increment usage count
    template.metadata.usageCount += 1;
    await template.save();

    return template;
  }

  // Rate template
  async rateTemplate(templateId: string, rating: number): Promise<Template> {
    const template = await this.templateModel.findById(templateId).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Update rating
    const totalRating = template.metadata.rating * template.metadata.ratingCount + rating;
    template.metadata.ratingCount += 1;
    template.metadata.rating = totalRating / template.metadata.ratingCount;

    return template.save();
  }

  // Example: Create photo book template from InDesign
  async createPhotoBookTemplateFromInDesign(indesignData: {
    name: string;
    category: TemplateCategory;
    style: TemplateStyle;
    indesignFile: string;
    exportedCanvases: any[];
    previews: any;
  }): Promise<Template> {
    return this.createTemplate({
      name: indesignData.name,
      description: `Beautiful ${indesignData.category.toLowerCase()} photo book template`,
      productType: ProductType.PHOTO_BOOK,
      category: indesignData.category,
      style: indesignData.style,
      dimensions: {
        width: 2400,  // 8x8 inches at 300 DPI
        height: 2400,
        orientation: 'portrait',
        pageCount: 20,
      },
      canvases: indesignData.exportedCanvases,
      previews: indesignData.previews,
      pricing: {
        isPremium: indesignData.style === TemplateStyle.ELEGANT || indesignData.style === TemplateStyle.ARTISTIC,
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

  // Private helper methods
  private calculateEstimatedTime(productType: ProductType, pageCount?: number): number {
    const baseTime = {
      [ProductType.PHOTO_BOOK]: 30,
      [ProductType.GREETING_CARD]: 10,
      [ProductType.BUSINESS_CARD]: 5,
      [ProductType.CALENDAR]: 45,
      [ProductType.POSTER]: 15,
      [ProductType.FLYER]: 10,
    };

    let time = baseTime[productType] || 15;
    
    if (pageCount && pageCount > 1) {
      time += (pageCount - 1) * 2; // 2 minutes per additional page
    }

    return time;
  }

  private isSeasonalTemplate(category: TemplateCategory): boolean {
    const seasonalCategories = [
      TemplateCategory.HOLIDAY,
      TemplateCategory.WEDDING,
      TemplateCategory.GRADUATION,
      TemplateCategory.SEASONAL,
    ];
    return seasonalCategories.includes(category);
  }

  private getSeasonalCategories(month: number): TemplateCategory[] {
    if (month >= 11 || month <= 1) {
      return [TemplateCategory.HOLIDAY, TemplateCategory.SEASONAL]; // Winter holidays
    } else if (month >= 2 && month <= 4) {
      return [TemplateCategory.WEDDING, TemplateCategory.SEASONAL]; // Spring weddings
    } else if (month >= 5 && month <= 6) {
      return [TemplateCategory.GRADUATION, TemplateCategory.WEDDING]; // Graduation season
    } else if (month >= 7 && month <= 8) {
      return [TemplateCategory.TRAVEL, TemplateCategory.FAMILY]; // Summer vacation
    } else {
      return [TemplateCategory.FAMILY, TemplateCategory.SEASONAL]; // Fall family photos
    }
  }

  private buildFilterQuery(filters: TemplateSearchFilters): any {
    const query: any = {};

    if (filters.category) query.category = filters.category;
    if (filters.style) query.style = filters.style;
    if (filters.isPremium !== undefined) query['pricing.isPremium'] = filters.isPremium;
    if (filters.featured) query['metadata.featured'] = true;
    if (filters.trending) query['metadata.trending'] = true;
    if (filters.difficulty) query['metadata.difficulty'] = filters.difficulty;
    if (filters.minRating) query['metadata.rating'] = { $gte: filters.minRating };

    return query;
  }
}
