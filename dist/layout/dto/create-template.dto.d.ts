import { ProductType } from '../../common/schemas/product-size.schema';
import { ImageSlot, TextSlot, BackgroundElement } from '../schemas/layout-template.schema';
export declare class CreateTemplateDto {
    name: string;
    description?: string;
    productType: ProductType;
    category: string;
    tags?: string[];
    imageCount: number;
    preferredOrientation?: 'portrait' | 'landscape' | 'square' | 'mixed';
    imageSlots: ImageSlot[];
    textSlots?: TextSlot[];
    background?: BackgroundElement;
    isPremium?: boolean;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
