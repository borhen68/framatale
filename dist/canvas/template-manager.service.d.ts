import { Model } from 'mongoose';
import { Template, TemplateDocument, TemplateCategory, TemplateStyle } from './schemas/template.schema';
import { ProductType } from './schemas/canvas.schema';
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
export declare class TemplateManagerService {
    private templateModel;
    constructor(templateModel: Model<TemplateDocument>);
    createTemplate(request: CreateTemplateRequest): Promise<Template>;
    getTemplatesForProduct(productType: ProductType, dimensions: {
        width: number;
        height: number;
        orientation: 'portrait' | 'landscape';
    }, filters?: TemplateSearchFilters): Promise<{
        templates: Template[];
        categories: TemplateCategory[];
        styles: TemplateStyle[];
        totalCount: number;
    }>;
    getFeaturedTemplates(productType?: ProductType): Promise<Template[]>;
    getTrendingTemplates(productType?: ProductType): Promise<Template[]>;
    getSeasonalTemplates(productType?: ProductType): Promise<Template[]>;
    searchTemplates(searchTerm: string, productType?: ProductType, filters?: TemplateSearchFilters): Promise<Template[]>;
    getTemplate(templateId: string): Promise<Template>;
    rateTemplate(templateId: string, rating: number): Promise<Template>;
    createPhotoBookTemplateFromInDesign(indesignData: {
        name: string;
        category: TemplateCategory;
        style: TemplateStyle;
        indesignFile: string;
        exportedCanvases: any[];
        previews: any;
    }): Promise<Template>;
    private calculateEstimatedTime;
    private isSeasonalTemplate;
    private getSeasonalCategories;
    private buildFilterQuery;
}
