import { TemplateManagerService, CreateTemplateRequest } from './template-manager.service';
import { Template, TemplateCategory, TemplateStyle } from './schemas/template.schema';
import { ProductType } from './schemas/canvas.schema';
export declare class TemplateController {
    private templateManager;
    constructor(templateManager: TemplateManagerService);
    getTemplatesForProduct(productType: ProductType, width: number, height: number, orientation: 'portrait' | 'landscape', category?: TemplateCategory, style?: TemplateStyle, featured?: boolean): Promise<{
        templates: Template[];
        categories: TemplateCategory[];
        styles: TemplateStyle[];
        totalCount: number;
    }>;
    getFeaturedTemplates(productType?: ProductType): Promise<Template[]>;
    getTrendingTemplates(productType?: ProductType): Promise<Template[]>;
    getSeasonalTemplates(productType?: ProductType): Promise<Template[]>;
    searchTemplates(searchTerm: string, productType?: ProductType, category?: TemplateCategory, style?: TemplateStyle): Promise<Template[]>;
    getTemplate(templateId: string): Promise<Template>;
    rateTemplate(templateId: string, ratingData: {
        rating: number;
    }): Promise<Template>;
    createTemplate(request: CreateTemplateRequest): Promise<Template>;
    createFromInDesign(indesignData: {
        name: string;
        category: TemplateCategory;
        style: TemplateStyle;
        indesignFile: string;
        exportedCanvases: any[];
        previews: any;
    }): Promise<Template>;
    createWeddingTemplate(): Promise<{
        message: string;
        template: Template;
        usage: string[];
    }>;
    get8x8Templates(): Promise<{
        message: string;
        productInfo: any;
        templates: Template[];
        explanation: string[];
    }>;
}
