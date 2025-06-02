import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductCost, ProductCostDocument } from './schemas/product-cost.schema';
import { PricingRequest, PricingResult } from './pricing-engine.service';

export interface CostPlusRequest {
  productType: string;
  variant?: string;
  quantity: number;
  region?: string;
  supplierId?: string;
}

export interface CostBreakdown {
  cogs: number;           // Cost of Goods Sold
  markup: number;         // Markup amount
  markupPercentage: number; // Markup percentage
  sellingPrice: number;   // Final selling price
  margin: number;         // Profit margin
  marginPercentage: number; // Margin percentage
}

export interface ProfitAnalysis {
  unitProfit: number;
  totalProfit: number;
  roi: number; // Return on Investment
  breakEvenQuantity: number;
  recommendedPrice: number;
}

@Injectable()
export class CostPlusPricingService {
  private readonly logger = new Logger(CostPlusPricingService.name);

  constructor(
    @InjectModel(ProductCost.name) private productCostModel: Model<ProductCostDocument>,
  ) {}

  async calculateCostPlusPrice(request: CostPlusRequest): Promise<{
    costBreakdown: CostBreakdown;
    profitAnalysis: ProfitAnalysis;
    recommendations: string[];
  }> {
    // Get product cost information
    const productCost = await this.getProductCost(request);
    
    if (!productCost) {
      throw new Error(`Cost information not found for product: ${request.productType}`);
    }

    // Calculate volume-based cost
    const unitCost = this.calculateVolumeCost(productCost, request.quantity);
    
    // Calculate cost breakdown
    const costBreakdown = this.calculateCostBreakdown(productCost, unitCost, request.quantity);
    
    // Analyze profitability
    const profitAnalysis = this.analyzeProfitability(costBreakdown, request.quantity);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(costBreakdown, profitAnalysis, productCost);

    return {
      costBreakdown,
      profitAnalysis,
      recommendations,
    };
  }

  async createProductCost(costData: {
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
      baseCost: number;        // e.g., $4.00 for photo book
      shippingCost: number;
      handlingFee: number;
      qualityControlCost: number;
      packagingCost: number;
    };
    pricing: {
      targetSellingPrice: number;  // e.g., $22.00 for photo book
      targetMargin: number;
      minimumMargin: number;
    };
    volumeTiers?: Array<{
      minQuantity: number;
      maxQuantity?: number;
      unitCost: number;
      discount: number;
    }>;
  }): Promise<ProductCost> {
    // Calculate total cost
    const totalCost = 
      costData.costs.baseCost +
      costData.costs.shippingCost +
      costData.costs.handlingFee +
      costData.costs.qualityControlCost +
      costData.costs.packagingCost;

    // Calculate recommended price based on target margin
    const recommendedPrice = totalCost / (1 - costData.pricing.targetMargin / 100);

    const productCost = new this.productCostModel({
      ...costData,
      costs: {
        ...costData.costs,
        totalCost,
      },
      pricing: {
        ...costData.pricing,
        recommendedPrice,
      },
      validFrom: new Date(),
      metadata: {
        currency: 'USD',
        lastUpdated: new Date(),
        updatedBy: 'system',
      },
    });

    return productCost.save();
  }

  // Example: Create photo book cost structure
  async createPhotoBookCost(): Promise<ProductCost> {
    return this.createProductCost({
      productType: 'photo_book',
      variant: 'standard_8x8',
      supplier: {
        supplierId: 'supplier_001',
        supplierName: 'Premium Print Co',
        supplierSku: 'PB-8X8-STD',
        minimumOrderQuantity: 10,
        leadTime: 5, // 5 days
        qualityRating: 4.5,
      },
      costs: {
        baseCost: 4.00,           // Your $4 cost from supplier
        shippingCost: 0.50,       // Shipping from supplier
        handlingFee: 0.25,        // Your handling cost
        qualityControlCost: 0.15, // QC cost
        packagingCost: 0.10,      // Packaging cost
        // Total COGS: $5.00
      },
      pricing: {
        targetSellingPrice: 22.00, // Your target $22 price
        targetMargin: 77.27,       // (22-5)/22 * 100 = 77.27% margin
        minimumMargin: 60.00,      // Minimum acceptable margin
      },
      volumeTiers: [
        { minQuantity: 1, maxQuantity: 9, unitCost: 5.00, discount: 0 },
        { minQuantity: 10, maxQuantity: 49, unitCost: 4.75, discount: 5 },
        { minQuantity: 50, maxQuantity: 99, unitCost: 4.50, discount: 10 },
        { minQuantity: 100, unitCost: 4.25, discount: 15 },
      ],
    });
  }

  async updateSupplierCosts(
    productType: string,
    newCosts: {
      baseCost?: number;
      shippingCost?: number;
      handlingFee?: number;
    },
  ): Promise<ProductCost> {
    const productCost = await this.productCostModel
      .findOne({ productType, isActive: true })
      .exec();

    if (!productCost) {
      throw new Error(`Product cost not found for: ${productType}`);
    }

    // Update costs
    if (newCosts.baseCost !== undefined) {
      productCost.costs.baseCost = newCosts.baseCost;
    }
    if (newCosts.shippingCost !== undefined) {
      productCost.costs.shippingCost = newCosts.shippingCost;
    }
    if (newCosts.handlingFee !== undefined) {
      productCost.costs.handlingFee = newCosts.handlingFee;
    }

    // Recalculate total cost
    productCost.costs.totalCost = 
      productCost.costs.baseCost +
      productCost.costs.shippingCost +
      productCost.costs.handlingFee +
      productCost.costs.qualityControlCost +
      productCost.costs.packagingCost;

    // Recalculate recommended price
    productCost.pricing.recommendedPrice = 
      productCost.costs.totalCost / (1 - productCost.pricing.targetMargin / 100);

    productCost.metadata.lastUpdated = new Date();

    return productCost.save();
  }

  async getProfitabilityReport(productType: string, timeRange: { start: Date; end: Date }): Promise<{
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    profitMargin: number;
    unitsSold: number;
    averageSellingPrice: number;
    averageCost: number;
    recommendations: string[];
  }> {
    // This would integrate with your order/sales data
    // For now, providing a structure for the report
    
    const productCost = await this.getProductCost({ productType, quantity: 1 });
    
    // Mock data - in production, this would come from actual sales data
    const mockSalesData = {
      unitsSold: 150,
      totalRevenue: 3300, // 150 units * $22 average
      totalCosts: 750,    // 150 units * $5 COGS
    };

    const totalProfit = mockSalesData.totalRevenue - mockSalesData.totalCosts;
    const profitMargin = (totalProfit / mockSalesData.totalRevenue) * 100;

    return {
      totalRevenue: mockSalesData.totalRevenue,
      totalCosts: mockSalesData.totalCosts,
      totalProfit,
      profitMargin,
      unitsSold: mockSalesData.unitsSold,
      averageSellingPrice: mockSalesData.totalRevenue / mockSalesData.unitsSold,
      averageCost: mockSalesData.totalCosts / mockSalesData.unitsSold,
      recommendations: [
        profitMargin > 75 ? 'Excellent profit margin! Consider expanding this product line.' : 'Consider optimizing costs or increasing prices.',
        'Monitor competitor pricing to ensure competitiveness.',
        'Negotiate better rates with suppliers for higher volumes.',
      ],
    };
  }

  // Private helper methods
  private async getProductCost(request: CostPlusRequest): Promise<ProductCostDocument | null> {
    const query: any = {
      productType: request.productType,
      isActive: true,
    };

    if (request.variant) {
      query.variant = request.variant;
    }

    if (request.supplierId) {
      query['supplier.supplierId'] = request.supplierId;
    }

    return this.productCostModel.findOne(query).exec();
  }

  private calculateVolumeCost(productCost: ProductCostDocument, quantity: number): number {
    if (!productCost.volumeTiers || productCost.volumeTiers.length === 0) {
      return productCost.costs.totalCost;
    }

    // Find applicable volume tier
    const applicableTier = productCost.volumeTiers.find(tier =>
      quantity >= tier.minQuantity &&
      (!tier.maxQuantity || quantity <= tier.maxQuantity)
    );

    return applicableTier ? applicableTier.unitCost : productCost.costs.totalCost;
  }

  private calculateCostBreakdown(
    productCost: ProductCostDocument,
    unitCost: number,
    quantity: number,
  ): CostBreakdown {
    const cogs = unitCost;
    const sellingPrice = productCost.pricing.targetSellingPrice;
    const markup = sellingPrice - cogs;
    const markupPercentage = (markup / cogs) * 100;
    const margin = sellingPrice - cogs;
    const marginPercentage = (margin / sellingPrice) * 100;

    return {
      cogs,
      markup,
      markupPercentage,
      sellingPrice,
      margin,
      marginPercentage,
    };
  }

  private analyzeProfitability(costBreakdown: CostBreakdown, quantity: number): ProfitAnalysis {
    const unitProfit = costBreakdown.margin;
    const totalProfit = unitProfit * quantity;
    const roi = (unitProfit / costBreakdown.cogs) * 100;
    
    // Calculate break-even quantity (fixed costs / unit profit)
    // Assuming $1000 in fixed costs for simplicity
    const fixedCosts = 1000;
    const breakEvenQuantity = Math.ceil(fixedCosts / unitProfit);
    
    // AI-recommended price based on market analysis
    const recommendedPrice = costBreakdown.cogs * 4.5; // 4.5x markup for photo books

    return {
      unitProfit,
      totalProfit,
      roi,
      breakEvenQuantity,
      recommendedPrice,
    };
  }

  private generateRecommendations(
    costBreakdown: CostBreakdown,
    profitAnalysis: ProfitAnalysis,
    productCost: ProductCostDocument,
  ): string[] {
    const recommendations: string[] = [];

    // Margin analysis
    if (costBreakdown.marginPercentage > 80) {
      recommendations.push('Excellent margin! Consider this as a premium product.');
    } else if (costBreakdown.marginPercentage > 60) {
      recommendations.push('Good margin. Monitor competitor pricing.');
    } else if (costBreakdown.marginPercentage > 40) {
      recommendations.push('Acceptable margin. Look for cost optimization opportunities.');
    } else {
      recommendations.push('Low margin. Consider increasing price or reducing costs.');
    }

    // Volume recommendations
    if (productCost.volumeTiers && productCost.volumeTiers.length > 0) {
      recommendations.push('Volume discounts available. Promote bulk orders to increase profitability.');
    }

    // Competitive analysis
    if (productCost.pricing.competitorPrice) {
      const competitorDiff = ((costBreakdown.sellingPrice - productCost.pricing.competitorPrice) / productCost.pricing.competitorPrice) * 100;
      
      if (competitorDiff > 10) {
        recommendations.push('Price is 10%+ above competitors. Consider price adjustment or value justification.');
      } else if (competitorDiff < -10) {
        recommendations.push('Price is 10%+ below competitors. Opportunity for price increase.');
      } else {
        recommendations.push('Price is competitive with market rates.');
      }
    }

    // ROI recommendations
    if (profitAnalysis.roi > 300) {
      recommendations.push('Excellent ROI! Consider expanding production capacity.');
    } else if (profitAnalysis.roi < 100) {
      recommendations.push('Low ROI. Review cost structure and pricing strategy.');
    }

    return recommendations;
  }
}
