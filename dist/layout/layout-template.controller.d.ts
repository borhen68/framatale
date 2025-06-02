import { LayoutTemplateService } from './layout-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { LayoutTemplate } from './schemas/layout-template.schema';
import { ProductType } from '../common/schemas/product-size.schema';
export declare class LayoutTemplateController {
    private templateService;
    constructor(templateService: LayoutTemplateService);
    create(createTemplateDto: CreateTemplateDto): Promise<LayoutTemplate>;
    findAll(productType?: ProductType, category?: string, tags?: string, imageCount?: number, minImageCount?: number, maxImageCount?: number, preferredOrientation?: 'portrait' | 'landscape' | 'square' | 'mixed', difficulty?: 'beginner' | 'intermediate' | 'advanced', isPremium?: boolean): Promise<LayoutTemplate[]>;
    findPopular(limit?: number, productType?: ProductType): Promise<LayoutTemplate[]>;
    findRecommended(imageCount: number, preferredOrientation: 'portrait' | 'landscape' | 'square' | 'mixed', productType: ProductType, limit?: number): Promise<LayoutTemplate[]>;
    getCategories(productType?: ProductType): Promise<string[]>;
    getTags(productType?: ProductType): Promise<string[]>;
    getStatistics(): Promise<any>;
    findById(id: string): Promise<LayoutTemplate>;
    update(id: string, updateData: Partial<LayoutTemplate>): Promise<LayoutTemplate>;
    incrementUsage(id: string): Promise<{
        message: string;
    }>;
    updateRating(id: string, rating: number): Promise<LayoutTemplate>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
