import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomizationPricing, CustomizationPricingDocument, CustomizationType, PricingModel } from './schemas/customization-pricing.schema';

export interface CustomizationRequest {
  productType: string;
  variant?: string;
  customizations: Array<{
    type: CustomizationType;
    quantity: number;        // e.g., 5 extra pages
    options?: any;          // Additional options
  }>;
  basePrice: number;        // Original product price
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

@Injectable()
export class DynamicCustomizationPricingService {
  private readonly logger = new Logger(DynamicCustomizationPricingService.name);

  constructor(
    @InjectModel(CustomizationPricing.name) 
    private customizationPricingModel: Model<CustomizationPricingDocument>,
  ) {}

  // Setup customization pricing for photo books
  async setupPhotoBookCustomizations(): Promise<CustomizationPricing[]> {
    const customizations = [
      // Extra pages - your main use case
      {
        productType: 'photo_book',
        customizationType: CustomizationType.EXTRA_PAGES,
        name: 'Extra Pages',
        description: 'Add additional pages to your photo book',
        pricingModel: PricingModel.PER_UNIT,
        supplierCost: 0.50,      // Supplier charges $0.50 per extra page
        markup: 0.50,           // You add $0.50 markup
        customerPrice: 1.00,     // Customer pays $1.00 per extra page
        limits: { min: 0, max: 100, default: 0 },
        display: {
          displayName: 'Add Extra Pages',
          icon: 'pages-icon',
          category: 'Layout',
          sortOrder: 1,
          tooltip: 'Add more pages to include more photos (+$1.00 per page)',
          previewImage: '/images/extra-pages-preview.jpg',
        },
        supplierInfo: {
          supplierId: 'printful',
          supplierSku: 'extra-page',
          processingTime: 0,      // No extra processing time
          availability: ['US', 'EU', 'UK'],
        },
      },

      // Cover upgrades
      {
        productType: 'photo_book',
        customizationType: CustomizationType.COVER_UPGRADE,
        name: 'Premium Cover',
        description: 'Upgrade to premium hardcover with dust jacket',
        pricingModel: PricingModel.FLAT_FEE,
        supplierCost: 3.00,      // Supplier charges $3 extra
        markup: 2.00,           // You add $2 markup  
        customerPrice: 5.00,     // Customer pays $5 upgrade
        display: {
          displayName: 'Premium Hardcover',
          icon: 'cover-icon',
          category: 'Cover',
          sortOrder: 1,
          tooltip: 'Upgrade to premium hardcover with dust jacket (+$5.00)',
          previewImage: '/images/premium-cover-preview.jpg',
        },
      },

      // Paper upgrade
      {
        productType: 'photo_book',
        customizationType: CustomizationType.PAPER_UPGRADE,
        name: 'Premium Paper',
        description: 'Upgrade to premium glossy paper',
        pricingModel: PricingModel.FLAT_FEE,
        supplierCost: 2.00,
        markup: 3.00,
        customerPrice: 5.00,
        display: {
          displayName: 'Premium Glossy Paper',
          icon: 'paper-icon',
          category: 'Paper',
          sortOrder: 1,
          tooltip: 'Upgrade to premium glossy paper for better photo quality (+$5.00)',
          previewImage: '/images/premium-paper-preview.jpg',
        },
      },

      // Size upgrade with tiered pricing
      {
        productType: 'photo_book',
        customizationType: CustomizationType.SIZE_UPGRADE,
        name: 'Size Upgrade',
        description: 'Upgrade to larger size',
        pricingModel: PricingModel.TIERED,
        supplierCost: 0,         // Base cost, actual cost in tiers
        markup: 0,              // Base markup, actual markup in tiers
        customerPrice: 0,        // Base price, actual price in tiers
        tiers: [
          // 8x8 to 10x10
          { minQuantity: 1, maxQuantity: 1, supplierCost: 2.00, customerPrice: 5.00, markup: 3.00 },
          // 8x8 to 12x12  
          { minQuantity: 2, maxQuantity: 2, supplierCost: 4.00, customerPrice: 10.00, markup: 6.00 },
          // 8x8 to 14x14
          { minQuantity: 3, maxQuantity: 3, supplierCost: 6.00, customerPrice: 15.00, markup: 9.00 },
        ],
        display: {
          displayName: 'Upgrade Size',
          icon: 'size-icon',
          category: 'Size',
          sortOrder: 1,
          tooltip: 'Upgrade to larger size (10x10: +$5, 12x12: +$10, 14x14: +$15)',
          previewImage: '/images/size-upgrade-preview.jpg',
        },
      },
    ];

    const savedCustomizations: CustomizationPricing[] = [];
    for (const customization of customizations) {
      const saved = await this.customizationPricingModel.create(customization);
      savedCustomizations.push(saved);
    }

    return savedCustomizations;
  }

  // Calculate price with customizations
  async calculateCustomizedPrice(request: CustomizationRequest): Promise<CustomizationResult> {
    const result: CustomizationResult = {
      basePrice: request.basePrice,
      customizations: [],
      totals: {
        basePrice: request.basePrice,
        customizationCost: 0,
        totalPrice: request.basePrice,
        totalSupplierCost: 0,
        totalMarkup: 0,
        marginPercentage: 0,
      },
      processingTime: {
        base: 3,        // Base processing time
        additional: 0,  // Additional time from customizations
        total: 3,
      },
    };

    // Process each customization
    for (const customization of request.customizations) {
      const pricing = await this.getCustomizationPricing(
        request.productType,
        customization.type,
        request.variant,
      );

      if (!pricing) {
        this.logger.warn(`Customization pricing not found: ${customization.type} for ${request.productType}`);
        continue;
      }

      const customizationResult = this.calculateCustomizationCost(pricing, customization.quantity);
      
      result.customizations.push({
        type: customization.type,
        name: pricing.name,
        quantity: customization.quantity,
        unitPrice: customizationResult.unitPrice,
        totalPrice: customizationResult.totalPrice,
        supplierCost: customizationResult.supplierCost,
        markup: customizationResult.markup,
        description: pricing.description,
      });

      // Add to totals
      result.totals.customizationCost += customizationResult.totalPrice;
      result.totals.totalSupplierCost += customizationResult.supplierCost;
      result.totals.totalMarkup += customizationResult.markup;

      // Add processing time
      if (pricing.supplierInfo?.processingTime) {
        result.processingTime.additional += pricing.supplierInfo.processingTime;
      }
    }

    // Calculate final totals
    result.totals.totalPrice = result.totals.basePrice + result.totals.customizationCost;
    result.totals.marginPercentage = (result.totals.totalMarkup / result.totals.totalPrice) * 100;
    result.processingTime.total = result.processingTime.base + result.processingTime.additional;

    return result;
  }

  // Get available customizations for a product
  async getAvailableCustomizations(productType: string, variant?: string): Promise<CustomizationPricing[]> {
    const query: any = {
      productType,
      isActive: true,
    };

    if (variant) {
      query.$or = [
        { variant },
        { variant: { $exists: false } },
      ];
    }

    return this.customizationPricingModel
      .find(query)
      .sort({ 'display.category': 1, 'display.sortOrder': 1 })
      .exec();
  }

  // Example: Customer adds 5 extra pages to photo book
  async exampleExtraPages(): Promise<CustomizationResult> {
    return this.calculateCustomizedPrice({
      productType: 'photo_book',
      variant: '8x8_hardcover',
      basePrice: 22.00,        // Original $22 photo book
      customizations: [
        {
          type: CustomizationType.EXTRA_PAGES,
          quantity: 5,          // Customer adds 5 extra pages
        },
      ],
    });

    // Result will be:
    // Base price: $22.00
    // Extra pages: 5 × $1.00 = $5.00
    // Total price: $27.00
    // Your extra profit: 5 × $0.50 = $2.50
  }

  // Example: Customer adds pages + premium cover
  async exampleMultipleCustomizations(): Promise<CustomizationResult> {
    return this.calculateCustomizedPrice({
      productType: 'photo_book',
      variant: '8x8_hardcover',
      basePrice: 22.00,
      customizations: [
        {
          type: CustomizationType.EXTRA_PAGES,
          quantity: 8,          // 8 extra pages
        },
        {
          type: CustomizationType.COVER_UPGRADE,
          quantity: 1,          // Premium cover upgrade
        },
        {
          type: CustomizationType.PAPER_UPGRADE,
          quantity: 1,          // Premium paper upgrade
        },
      ],
    });

    // Result will be:
    // Base price: $22.00
    // Extra pages: 8 × $1.00 = $8.00
    // Premium cover: $5.00
    // Premium paper: $5.00
    // Total price: $40.00
    // Your extra profit: (8 × $0.50) + $2.00 + $3.00 = $9.00
  }

  // Update customization pricing
  async updateCustomizationPrice(
    productType: string,
    customizationType: CustomizationType,
    updates: {
      supplierCost?: number;
      markup?: number;
      customerPrice?: number;
    },
  ): Promise<CustomizationPricing> {
    const customization = await this.customizationPricingModel
      .findOne({ productType, customizationType, isActive: true })
      .exec();

    if (!customization) {
      throw new Error(`Customization not found: ${customizationType} for ${productType}`);
    }

    if (updates.supplierCost !== undefined) {
      customization.supplierCost = updates.supplierCost;
    }
    if (updates.markup !== undefined) {
      customization.markup = updates.markup;
    }
    if (updates.customerPrice !== undefined) {
      customization.customerPrice = updates.customerPrice;
    }

    // Recalculate customer price if not provided
    if (updates.customerPrice === undefined && (updates.supplierCost !== undefined || updates.markup !== undefined)) {
      customization.customerPrice = customization.supplierCost + customization.markup;
    }

    return customization.save();
  }

  // Private helper methods
  private async getCustomizationPricing(
    productType: string,
    customizationType: CustomizationType,
    variant?: string,
  ): Promise<CustomizationPricingDocument | null> {
    const query: any = {
      productType,
      customizationType,
      isActive: true,
    };

    if (variant) {
      query.$or = [
        { variant },
        { variant: { $exists: false } },
      ];
    }

    return this.customizationPricingModel.findOne(query).exec();
  }

  private calculateCustomizationCost(
    pricing: CustomizationPricingDocument,
    quantity: number,
  ): {
    unitPrice: number;
    totalPrice: number;
    supplierCost: number;
    markup: number;
  } {
    let unitPrice: number;
    let unitSupplierCost: number;
    let unitMarkup: number;

    switch (pricing.pricingModel) {
      case PricingModel.PER_UNIT:
        unitPrice = pricing.customerPrice;
        unitSupplierCost = pricing.supplierCost;
        unitMarkup = pricing.markup;
        break;

      case PricingModel.FLAT_FEE:
        unitPrice = pricing.customerPrice;
        unitSupplierCost = pricing.supplierCost;
        unitMarkup = pricing.markup;
        quantity = 1; // Flat fee is always quantity 1
        break;

      case PricingModel.TIERED:
        const tier = pricing.tiers?.find(t =>
          quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
        );
        
        if (tier) {
          unitPrice = tier.customerPrice;
          unitSupplierCost = tier.supplierCost;
          unitMarkup = tier.markup;
        } else {
          unitPrice = pricing.customerPrice;
          unitSupplierCost = pricing.supplierCost;
          unitMarkup = pricing.markup;
        }
        break;

      case PricingModel.PERCENTAGE:
        // This would be percentage of base price
        unitPrice = pricing.customerPrice;
        unitSupplierCost = pricing.supplierCost;
        unitMarkup = pricing.markup;
        break;

      default:
        unitPrice = pricing.customerPrice;
        unitSupplierCost = pricing.supplierCost;
        unitMarkup = pricing.markup;
    }

    return {
      unitPrice,
      totalPrice: unitPrice * quantity,
      supplierCost: unitSupplierCost * quantity,
      markup: unitMarkup * quantity,
    };
  }
}
