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
export declare class LayoutTemplateService {
    private templateModel;
    constructor(templateModel: Model<LayoutTemplateDocument>);
    create(createTemplateDto: CreateTemplateDto): Promise<LayoutTemplate>;
    findAll(filter?: TemplateFilter): Promise<LayoutTemplate[]>;
    findById(id: string): Promise<LayoutTemplateDocument>;
    findByProductType(productType: ProductType): Promise<LayoutTemplate[]>;
    findByImageCount(imageCount: number, productType?: ProductType): Promise<LayoutTemplate[]>;
    findByCategory(category: string, productType?: ProductType): Promise<LayoutTemplate[]>;
    findPopular(limit?: number, productType?: ProductType): Promise<LayoutTemplate[]>;
    findRecommended(imageCount: number, preferredOrientation: 'portrait' | 'landscape' | 'square' | 'mixed', productType: ProductType, limit?: number): Promise<LayoutTemplate[]>;
    update(id: string, updateData: Partial<LayoutTemplate>): Promise<LayoutTemplate>;
    incrementUsage(id: string): Promise<void>;
    updateRating(id: string, newRating: number): Promise<LayoutTemplate>;
    delete(id: string): Promise<void>;
    getCategories(productType?: ProductType): Promise<string[]>;
    getTags(productType?: ProductType): Promise<string[]>;
    getStatistics(): Promise<{
        totalTemplates: number;
        templatesByProductType: Record<string, number>;
        templatesByCategory: Record<string, number>;
        averageImageCount: number;
        mostPopularTemplate: LayoutTemplate | null;
    }>;
}
