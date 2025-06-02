import { Model } from 'mongoose';
import { ProductCost, ProductCostDocument } from './schemas/product-cost.schema';
export interface CostPlusRequest {
    productType: string;
    variant?: string;
    quantity: number;
    region?: string;
    supplierId?: string;
}
export interface CostBreakdown {
    cogs: number;
    markup: number;
    markupPercentage: number;
    sellingPrice: number;
    margin: number;
    marginPercentage: number;
}
export interface ProfitAnalysis {
    unitProfit: number;
    totalProfit: number;
    roi: number;
    breakEvenQuantity: number;
    recommendedPrice: number;
}
export declare class CostPlusPricingService {
    private productCostModel;
    private readonly logger;
    constructor(productCostModel: Model<ProductCostDocument>);
    calculateCostPlusPrice(request: CostPlusRequest): Promise<{
        costBreakdown: CostBreakdown;
        profitAnalysis: ProfitAnalysis;
        recommendations: string[];
    }>;
    createProductCost(costData: {
        productType: string;
        variant?: string;
        supplier: {
            supplierId: string;
            supplierName: string;
            supplierSku: string;
            minimumOrderQuantity: number;
            leadTime: number;
            qualityRating: number;
        };
        costs: {
            baseCost: number;
            shippingCost: number;
            handlingFee: number;
            qualityControlCost: number;
            packagingCost: number;
        };
        pricing: {
            targetSellingPrice: number;
            targetMargin: number;
            minimumMargin: number;
        };
        volumeTiers?: Array<{
            minQuantity: number;
            maxQuantity?: number;
            unitCost: number;
            discount: number;
        }>;
    }): Promise<ProductCost>;
    createPhotoBookCost(): Promise<ProductCost>;
    updateSupplierCosts(productType: string, newCosts: {
        baseCost?: number;
        shippingCost?: number;
        handlingFee?: number;
    }): Promise<ProductCost>;
    getProfitabilityReport(productType: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        totalRevenue: number;
        totalCosts: number;
        totalProfit: number;
        profitMargin: number;
        unitsSold: number;
        averageSellingPrice: number;
        averageCost: number;
        recommendations: string[];
    }>;
    private getProductCost;
    private calculateVolumeCost;
    private calculateCostBreakdown;
    private analyzeProfitability;
    private generateRecommendations;
}
