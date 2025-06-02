import { ProductType } from '../../common/schemas/product-size.schema';
export declare class CreateProjectDto {
    title: string;
    description?: string;
    type: ProductType;
    sizeCode: string;
    images?: string[];
    totalPages?: number;
    tags?: string[];
}
