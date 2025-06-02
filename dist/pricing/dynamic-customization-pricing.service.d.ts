import { Model } from 'mongoose';
import { CustomizationPricing, CustomizationPricingDocument, CustomizationType } from './schemas/customization-pricing.schema';
export interface CustomizationRequest {
    productType: string;
    variant?: string;
    customizations: Array<{
        type: CustomizationType;
        quantity: number;
        options?: any;
    }>;
    basePrice: number;
}
export interface CustomizationResult {
    basePrice: number;
    customizations: Array<{
        type: CustomizationType;
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        supplierCost: number;
        markup: number;
        description?: string;
    }>;
    totals: {
        basePrice: number;
        customizationCost: number;
        totalPrice: number;
        totalSupplierCost: number;
        totalMarkup: number;
        marginPercentage: number;
    };
    processingTime: {
        base: number;
        additional: number;
        total: number;
    };
}
export declare class DynamicCustomizationPricingService {
    private customizationPricingModel;
    private readonly logger;
    constructor(customizationPricingModel: Model<CustomizationPricingDocument>);
    setupPhotoBookCustomizations(): Promise<CustomizationPricing[]>;
    calculateCustomizedPrice(request: CustomizationRequest): Promise<CustomizationResult>;
    getAvailableCustomizations(productType: string, variant?: string): Promise<CustomizationPricing[]>;
    exampleExtraPages(): Promise<CustomizationResult>;
    exampleMultipleCustomizations(): Promise<CustomizationResult>;
    updateCustomizationPrice(productType: string, customizationType: CustomizationType, updates: {
        supplierCost?: number;
        markup?: number;
        customerPrice?: number;
    }): Promise<CustomizationPricing>;
    private getCustomizationPricing;
    private calculateCustomizationCost;
}
