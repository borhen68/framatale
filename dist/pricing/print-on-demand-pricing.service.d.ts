import { Model } from 'mongoose';
import { SupplierProduct, SupplierProductDocument, SupplierType } from './schemas/supplier-product.schema';
export interface SupplierPriceRequest {
    productType: string;
    variant: string;
    quantity: number;
    region?: string;
    preferredSupplier?: SupplierType;
}
export interface PriceCalculation {
    supplierPrice: number;
    yourPrice: number;
    markup: number;
    markupPercentage: number;
    marginPercentage: number;
    profit: number;
    totalProfit: number;
    supplier: SupplierType;
    productDetails: {
        title: string;
        specifications: any;
        shipping: any;
    };
}
export interface SupplierComparison {
    product: SupplierProduct;
    calculation: PriceCalculation;
    competitiveness: 'best_price' | 'best_margin' | 'fastest_shipping' | 'highest_quality';
}
export declare class PrintOnDemandPricingService {
    private supplierProductModel;
    private readonly logger;
    constructor(supplierProductModel: Model<SupplierProductDocument>);
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
    addPhotoBookFromPrintful(): Promise<SupplierProduct>;
    calculatePrice(request: SupplierPriceRequest): Promise<PriceCalculation>;
    compareSuppliers(request: SupplierPriceRequest): Promise<SupplierComparison[]>;
    updateMarkup(productType: string, variant: string, supplier: SupplierType, newMarkup: number, markupType: 'amount' | 'percentage'): Promise<SupplierProduct>;
    syncSupplierPrices(supplier: SupplierType): Promise<{
        updated: number;
        errors: string[];
    }>;
    getProfitReport(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        totalRevenue: number;
        totalCosts: number;
        totalProfit: number;
        profitMargin: number;
        topProducts: Array<{
            product: string;
            revenue: number;
            profit: number;
            margin: number;
            orders: number;
        }>;
        supplierBreakdown: Array<{
            supplier: SupplierType;
            revenue: number;
            profit: number;
            orders: number;
        }>;
    }>;
    private findBestProduct;
    private fetchSupplierPrice;
    private getSupplierApiEndpoint;
}
