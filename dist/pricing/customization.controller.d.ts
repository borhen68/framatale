import { DynamicCustomizationPricingService, CustomizationRequest, CustomizationResult } from './dynamic-customization-pricing.service';
import { CustomizationPricing, CustomizationType } from './schemas/customization-pricing.schema';
export declare class CustomizationController {
    private customizationPricingService;
    constructor(customizationPricingService: DynamicCustomizationPricingService);
    calculateCustomizedPrice(request: CustomizationRequest): Promise<CustomizationResult>;
    getAvailableCustomizations(productType: string, variant?: string): Promise<CustomizationPricing[]>;
    setupPhotoBookCustomizations(): Promise<CustomizationPricing[]>;
    updateCustomizationPrice(productType: string, customizationType: CustomizationType, updates: {
        supplierCost?: number;
        markup?: number;
        customerPrice?: number;
    }): Promise<CustomizationPricing>;
    exampleExtraPages(): Promise<{
        scenario: string;
        calculation: CustomizationResult;
        explanation: string[];
    }>;
    exampleMultipleCustomizations(): Promise<{
        scenario: string;
        calculation: CustomizationResult;
        breakdown: string[];
    }>;
    editorIntegration(request: {
        productType: string;
        variant?: string;
        basePrice: number;
        currentCustomizations: Array<{
            type: CustomizationType;
            quantity: number;
        }>;
        newCustomization?: {
            type: CustomizationType;
            quantity: number;
        };
    }): Promise<{
        currentPrice: CustomizationResult;
        newPrice?: CustomizationResult;
        priceChange?: {
            amount: number;
            percentage: number;
        };
    }>;
    getPricingGuide(productType: string): Promise<{
        product: string;
        basePrice: number;
        customizations: Array<{
            type: string;
            name: string;
            description: string;
            pricing: string;
            examples: string[];
        }>;
    }>;
    private formatPricingDescription;
    private generatePricingExamples;
}
