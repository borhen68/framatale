import { PrintOnDemandPricingService, SupplierPriceRequest, PriceCalculation, SupplierComparison } from './print-on-demand-pricing.service';
import { SupplierProduct, SupplierType } from './schemas/supplier-product.schema';
export declare class PrintOnDemandController {
    private podPricingService;
    constructor(podPricingService: PrintOnDemandPricingService);
    calculatePrice(request: SupplierPriceRequest): Promise<PriceCalculation>;
    compareSuppliers(request: SupplierPriceRequest): Promise<SupplierComparison[]>;
    addSupplierProduct(productData: {
        supplier: SupplierType;
        supplierProductId: string;
        productType: string;
        variant: string;
        title: string;
        supplierPrice: number;
        desiredMarkup: number;
        markupType: 'amount' | 'percentage';
        specifications: any;
        shipping: any;
    }): Promise<SupplierProduct>;
    setupPhotoBook(): Promise<SupplierProduct>;
    updateMarkup(productType: string, variant: string, supplier: SupplierType, updateData: {
        newMarkup: number;
        markupType: 'amount' | 'percentage';
    }): Promise<SupplierProduct>;
    syncSupplierPrices(supplier: SupplierType): Promise<{
        updated: number;
        errors: string[];
    }>;
    getProfitReport(startDate: string, endDate: string): Promise<any>;
    examplePhotoBookPricing(): Promise<{
        example: string;
        calculation: PriceCalculation;
        explanation: string[];
    }>;
    calculateMarkup(supplierPrice: number, sellingPrice?: number, markupAmount?: number, markupPercentage?: number): Promise<{
        supplierPrice: number;
        sellingPrice: number;
        markupAmount: number;
        markupPercentage: number;
        marginPercentage: number;
        examples: string[];
    }>;
}
