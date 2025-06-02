import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

@Injectable()
export class PrintOnDemandPricingService {
  private readonly logger = new Logger(PrintOnDemandPricingService.name);

  constructor(
    @InjectModel(SupplierProduct.name) private supplierProductModel: Model<SupplierProductDocument>,
  ) {}

  // Add a new product from supplier with your markup
  async addSupplierProduct(productData: {
    supplier: SupplierType;
    supplierProductId: string;
    productType: string;
    variant: string;
    title: string;
    supplierPrice: number;    // e.g., $4.00 from Printful
    desiredMarkup: number;    // e.g., $18.00 or 450%
    markupType: 'amount' | 'percentage';
    specifications: any;
    shipping: any;
  }): Promise<SupplierProduct> {
    
    let sellingPrice: number;
    let markup: number;
    let markupPercentage: number;
    let marginPercentage: number;

    if (productData.markupType === 'amount') {
      // You want to add $18 markup on $4 cost = $22 selling price
      markup = productData.desiredMarkup;
      sellingPrice = productData.supplierPrice + markup;
      markupPercentage = (markup / productData.supplierPrice) * 100;
      marginPercentage = (markup / sellingPrice) * 100;
    } else {
      // You want 450% markup on $4 cost
      markupPercentage = productData.desiredMarkup;
      markup = productData.supplierPrice * (markupPercentage / 100);
      sellingPrice = productData.supplierPrice + markup;
      marginPercentage = (markup / sellingPrice) * 100;
    }

    const supplierProduct = new this.supplierProductModel({
      supplier: productData.supplier,
      supplierProductId: productData.supplierProductId,
      productType: productData.productType,
      variant: productData.variant,
      title: productData.title,
      supplierPrice: productData.supplierPrice,
      sellingPrice,
      markup,
      markupPercentage,
      marginPercentage,
      specifications: productData.specifications,
      shipping: productData.shipping,
      apiInfo: {
        apiEndpoint: this.getSupplierApiEndpoint(productData.supplier),
        lastSynced: new Date(),
        syncStatus: 'active',
        apiVersion: '1.0',
      },
      metadata: {
        category: productData.productType,
        tags: [productData.variant],
        popularity: 0,
        totalOrders: 0,
        revenue: 0,
      },
    });

    return supplierProduct.save();
  }

  // Example: Add photo book from Printful
  async addPhotoBookFromPrintful(): Promise<SupplierProduct> {
    return this.addSupplierProduct({
      supplier: SupplierType.PRINTFUL,
      supplierProductId: 'printful_photobook_8x8',
      productType: 'photo_book',
      variant: '8x8_hardcover',
      title: '8x8 Hardcover Photo Book',
      supplierPrice: 4.00,        // Printful charges $4
      desiredMarkup: 18.00,       // You want $18 profit
      markupType: 'amount',       // Adding $18 amount
      specifications: {
        width: 8,
        height: 8,
        unit: 'inches',
        material: 'hardcover',
        printMethod: 'digital',
        pages: 20,
      },
      shipping: {
        shippingCost: 0,          // Printful handles shipping
        processingTime: 3,        // 3 days processing
        shippingTime: 5,          // 5 days shipping
        totalTime: 8,             // 8 days total
        regions: ['US', 'EU', 'UK'],
      },
    });
  }

  // Calculate price for a specific product and quantity
  async calculatePrice(request: SupplierPriceRequest): Promise<PriceCalculation> {
    const product = await this.findBestProduct(request);
    
    if (!product) {
      throw new Error(`Product not found: ${request.productType} - ${request.variant}`);
    }

    // Check for volume pricing
    let supplierPrice = product.supplierPrice;
    let sellingPrice = product.sellingPrice;
    
    if (product.volumePricing && request.quantity > 1) {
      const volumeTier = product.volumePricing.find(tier =>
        request.quantity >= tier.minQuantity &&
        (!tier.maxQuantity || request.quantity <= tier.maxQuantity)
      );
      
      if (volumeTier) {
        supplierPrice = volumeTier.supplierPrice;
        sellingPrice = volumeTier.sellingPrice;
      }
    }

    const markup = sellingPrice - supplierPrice;
    const markupPercentage = (markup / supplierPrice) * 100;
    const marginPercentage = (markup / sellingPrice) * 100;
    const profit = markup;
    const totalProfit = profit * request.quantity;

    return {
      supplierPrice,
      yourPrice: sellingPrice,
      markup,
      markupPercentage,
      marginPercentage,
      profit,
      totalProfit,
      supplier: product.supplier,
      productDetails: {
        title: product.title,
        specifications: product.specifications,
        shipping: product.shipping,
      },
    };
  }

  // Compare prices across all suppliers for the same product
  async compareSuppliers(request: SupplierPriceRequest): Promise<SupplierComparison[]> {
    const products = await this.supplierProductModel
      .find({
        productType: request.productType,
        variant: request.variant,
        isActive: true,
        isAvailable: true,
      })
      .exec();

    const comparisons: SupplierComparison[] = [];

    for (const product of products) {
      const calculation = await this.calculatePrice({
        ...request,
        preferredSupplier: product.supplier,
      });

      let competitiveness: SupplierComparison['competitiveness'] = 'best_price';
      
      // Determine competitiveness
      if (product.supplierPrice === Math.min(...products.map(p => p.supplierPrice))) {
        competitiveness = 'best_price';
      } else if (product.marginPercentage === Math.max(...products.map(p => p.marginPercentage))) {
        competitiveness = 'best_margin';
      } else if (product.shipping.totalTime === Math.min(...products.map(p => p.shipping.totalTime))) {
        competitiveness = 'fastest_shipping';
      }

      comparisons.push({
        product,
        calculation,
        competitiveness,
      });
    }

    return comparisons.sort((a, b) => b.calculation.marginPercentage - a.calculation.marginPercentage);
  }

  // Update your markup for a product
  async updateMarkup(
    productType: string,
    variant: string,
    supplier: SupplierType,
    newMarkup: number,
    markupType: 'amount' | 'percentage',
  ): Promise<SupplierProduct> {
    const product = await this.supplierProductModel
      .findOne({ productType, variant, supplier, isActive: true })
      .exec();

    if (!product) {
      throw new Error('Product not found');
    }

    let sellingPrice: number;
    let markup: number;
    let markupPercentage: number;
    let marginPercentage: number;

    if (markupType === 'amount') {
      markup = newMarkup;
      sellingPrice = product.supplierPrice + markup;
      markupPercentage = (markup / product.supplierPrice) * 100;
      marginPercentage = (markup / sellingPrice) * 100;
    } else {
      markupPercentage = newMarkup;
      markup = product.supplierPrice * (markupPercentage / 100);
      sellingPrice = product.supplierPrice + markup;
      marginPercentage = (markup / sellingPrice) * 100;
    }

    product.sellingPrice = sellingPrice;
    product.markup = markup;
    product.markupPercentage = markupPercentage;
    product.marginPercentage = marginPercentage;

    return product.save();
  }

  // Sync prices from supplier API (mock implementation)
  async syncSupplierPrices(supplier: SupplierType): Promise<{
    updated: number;
    errors: string[];
  }> {
    const products = await this.supplierProductModel
      .find({ supplier, isActive: true })
      .exec();

    let updated = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        // Mock API call to get latest price
        const latestPrice = await this.fetchSupplierPrice(supplier, product.supplierProductId);
        
        if (latestPrice !== product.supplierPrice) {
          // Update supplier price but keep your markup
          const oldSupplierPrice = product.supplierPrice;
          const newSupplierPrice = latestPrice;
          
          // Maintain the same markup amount
          const newSellingPrice = newSupplierPrice + product.markup;
          const newMarkupPercentage = (product.markup / newSupplierPrice) * 100;
          const newMarginPercentage = (product.markup / newSellingPrice) * 100;

          product.supplierPrice = newSupplierPrice;
          product.sellingPrice = newSellingPrice;
          product.markupPercentage = newMarkupPercentage;
          product.marginPercentage = newMarginPercentage;
          product.apiInfo.lastSynced = new Date();

          await product.save();
          updated++;

          this.logger.log(`Updated ${product.title}: ${oldSupplierPrice} -> ${newSupplierPrice}`);
        }
      } catch (error) {
        errors.push(`Failed to sync ${product.title}: ${error.message}`);
      }
    }

    return { updated, errors };
  }

  // Get profit report for your products
  async getProfitReport(timeRange: { start: Date; end: Date }): Promise<{
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
  }> {
    // This would integrate with your actual order data
    // For now, providing mock data structure
    
    const products = await this.supplierProductModel.find({ isActive: true }).exec();
    
    // Mock calculations
    const totalRevenue = 15000;
    const totalCosts = 3000;
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = (totalProfit / totalRevenue) * 100;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      topProducts: [
        {
          product: '8x8 Photo Book',
          revenue: 5500,
          profit: 4500,
          margin: 81.8,
          orders: 250,
        },
        {
          product: '12x12 Canvas Print',
          revenue: 3200,
          profit: 2400,
          margin: 75.0,
          orders: 80,
        },
      ],
      supplierBreakdown: [
        {
          supplier: SupplierType.PRINTFUL,
          revenue: 8000,
          profit: 6500,
          orders: 200,
        },
        {
          supplier: SupplierType.PRINTIFY,
          revenue: 7000,
          profit: 5500,
          orders: 180,
        },
      ],
    };
  }

  // Private helper methods
  private async findBestProduct(request: SupplierPriceRequest): Promise<SupplierProductDocument | null> {
    const query: any = {
      productType: request.productType,
      variant: request.variant,
      isActive: true,
      isAvailable: true,
    };

    if (request.preferredSupplier) {
      query.supplier = request.preferredSupplier;
    }

    // Find product with best margin if no preferred supplier
    return this.supplierProductModel
      .findOne(query)
      .sort({ marginPercentage: -1 })
      .exec();
  }

  private async fetchSupplierPrice(supplier: SupplierType, productId: string): Promise<number> {
    // Mock API call - in production, this would call actual supplier APIs
    switch (supplier) {
      case SupplierType.PRINTFUL:
        return 4.25; // Mock updated price
      case SupplierType.PRINTIFY:
        return 3.95;
      default:
        return 4.00;
    }
  }

  private getSupplierApiEndpoint(supplier: SupplierType): string {
    switch (supplier) {
      case SupplierType.PRINTFUL:
        return 'https://api.printful.com';
      case SupplierType.PRINTIFY:
        return 'https://api.printify.com';
      case SupplierType.CLOUD_PRINT:
        return 'https://api.cloudprint.com';
      case SupplierType.RIP_PRINT:
        return 'https://api.ripprint.com';
      default:
        return '';
    }
  }
}
