import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { 
  DynamicCustomizationPricingService, 
  CustomizationRequest, 
  CustomizationResult 
} from './dynamic-customization-pricing.service';
import { CustomizationPricing, CustomizationType } from './schemas/customization-pricing.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@ApiTags('Product Customization Pricing')
@Controller('pricing/customizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomizationController {
  constructor(private customizationPricingService: DynamicCustomizationPricingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate price with customizations' })
  @ApiResponse({ status: 200, description: 'Customized price calculated successfully' })
  async calculateCustomizedPrice(@Body() request: CustomizationRequest): Promise<CustomizationResult> {
    return this.customizationPricingService.calculateCustomizedPrice(request);
  }

  @Get('available/:productType')
  @ApiOperation({ summary: 'Get available customizations for a product' })
  @ApiQuery({ name: 'variant', required: false })
  @ApiResponse({ status: 200, description: 'Available customizations retrieved successfully' })
  async getAvailableCustomizations(
    @Param('productType') productType: string,
    @Query('variant') variant?: string,
  ): Promise<CustomizationPricing[]> {
    return this.customizationPricingService.getAvailableCustomizations(productType, variant);
  }

  @Post('setup/photo-book')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Setup photo book customizations (Admin only)' })
  @ApiResponse({ status: 201, description: 'Photo book customizations setup successfully' })
  async setupPhotoBookCustomizations(): Promise<CustomizationPricing[]> {
    return this.customizationPricingService.setupPhotoBookCustomizations();
  }

  @Put(':productType/:customizationType/pricing')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update customization pricing (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customization pricing updated successfully' })
  async updateCustomizationPrice(
    @Param('productType') productType: string,
    @Param('customizationType') customizationType: CustomizationType,
    @Body() updates: {
      supplierCost?: number;
      markup?: number;
      customerPrice?: number;
    },
  ): Promise<CustomizationPricing> {
    return this.customizationPricingService.updateCustomizationPrice(
      productType,
      customizationType,
      updates,
    );
  }

  // Real-world examples for your use case
  @Post('examples/extra-pages')
  @ApiOperation({ summary: 'Example: Customer adds extra pages to photo book' })
  @ApiResponse({ status: 200, description: 'Extra pages pricing calculated' })
  async exampleExtraPages(): Promise<{
    scenario: string;
    calculation: CustomizationResult;
    explanation: string[];
  }> {
    const calculation = await this.customizationPricingService.exampleExtraPages();

    return {
      scenario: 'Customer adds 5 extra pages to $22 photo book',
      calculation,
      explanation: [
        `Original photo book: $${calculation.basePrice}`,
        `Extra pages: ${calculation.customizations[0]?.quantity} × $${calculation.customizations[0]?.unitPrice} = $${calculation.customizations[0]?.totalPrice}`,
        `New total: $${calculation.totals.totalPrice}`,
        `Your extra profit: $${calculation.customizations[0]?.markup}`,
        `Supplier extra cost: $${calculation.customizations[0]?.supplierCost}`,
        'Customer pays more, you profit more!',
      ],
    };
  }

  @Post('examples/multiple-upgrades')
  @ApiOperation({ summary: 'Example: Customer adds multiple customizations' })
  @ApiResponse({ status: 200, description: 'Multiple customizations pricing calculated' })
  async exampleMultipleCustomizations(): Promise<{
    scenario: string;
    calculation: CustomizationResult;
    breakdown: string[];
  }> {
    const calculation = await this.customizationPricingService.exampleMultipleCustomizations();

    const breakdown = [
      `Base photo book: $${calculation.basePrice}`,
      ...calculation.customizations.map(c => 
        `${c.name}: ${c.quantity > 1 ? `${c.quantity} × ` : ''}$${c.unitPrice} = $${c.totalPrice} (your profit: $${c.markup})`
      ),
      `Total price: $${calculation.totals.totalPrice}`,
      `Total extra profit: $${calculation.totals.totalMarkup}`,
      `Processing time: ${calculation.processingTime.total} days`,
    ];

    return {
      scenario: 'Customer adds 8 extra pages + premium cover + premium paper',
      calculation,
      breakdown,
    };
  }

  @Post('editor-integration')
  @ApiOperation({ summary: 'Real-time pricing for editor integration' })
  @ApiResponse({ status: 200, description: 'Real-time pricing calculated' })
  async editorIntegration(
    @Body() request: {
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
    },
  ): Promise<{
    currentPrice: CustomizationResult;
    newPrice?: CustomizationResult;
    priceChange?: {
      amount: number;
      percentage: number;
    };
  }> {
    // Calculate current price
    const currentPrice = await this.customizationPricingService.calculateCustomizedPrice({
      productType: request.productType,
      variant: request.variant,
      basePrice: request.basePrice,
      customizations: request.currentCustomizations,
    });

    let newPrice: CustomizationResult | undefined;
    let priceChange: { amount: number; percentage: number } | undefined;

    // If adding new customization, calculate new price
    if (request.newCustomization) {
      newPrice = await this.customizationPricingService.calculateCustomizedPrice({
        productType: request.productType,
        variant: request.variant,
        basePrice: request.basePrice,
        customizations: [...request.currentCustomizations, request.newCustomization],
      });

      const priceDiff = newPrice.totals.totalPrice - currentPrice.totals.totalPrice;
      priceChange = {
        amount: priceDiff,
        percentage: (priceDiff / currentPrice.totals.totalPrice) * 100,
      };
    }

    return {
      currentPrice,
      newPrice,
      priceChange,
    };
  }

  @Get('pricing-guide/:productType')
  @ApiOperation({ summary: 'Get pricing guide for product customizations' })
  @ApiResponse({ status: 200, description: 'Pricing guide retrieved successfully' })
  async getPricingGuide(@Param('productType') productType: string): Promise<{
    product: string;
    basePrice: number;
    customizations: Array<{
      type: string;
      name: string;
      description: string;
      pricing: string;
      examples: string[];
    }>;
  }> {
    const customizations = await this.customizationPricingService.getAvailableCustomizations(productType);

    return {
      product: productType,
      basePrice: 22.00, // Example base price
      customizations: customizations.map(c => ({
        type: c.customizationType,
        name: c.name,
        description: c.description || '',
        pricing: this.formatPricingDescription(c),
        examples: this.generatePricingExamples(c),
      })),
    };
  }

  // Private helper methods
  private formatPricingDescription(customization: CustomizationPricing): string {
    switch (customization.pricingModel) {
      case 'PER_UNIT':
        return `$${customization.customerPrice} per ${customization.customizationType.toLowerCase().replace('_', ' ')}`;
      case 'FLAT_FEE':
        return `$${customization.customerPrice} flat fee`;
      case 'TIERED':
        return 'Tiered pricing based on quantity';
      case 'PERCENTAGE':
        return `${customization.customerPrice}% of base price`;
      default:
        return `$${customization.customerPrice}`;
    }
  }

  private generatePricingExamples(customization: CustomizationPricing): string[] {
    const examples: string[] = [];

    switch (customization.customizationType) {
      case CustomizationType.EXTRA_PAGES:
        examples.push(
          '1 extra page: +$1.00',
          '5 extra pages: +$5.00',
          '10 extra pages: +$10.00',
        );
        break;
      case CustomizationType.COVER_UPGRADE:
        examples.push(
          'Premium hardcover: +$5.00',
          'Includes dust jacket',
          'Better protection and presentation',
        );
        break;
      case CustomizationType.PAPER_UPGRADE:
        examples.push(
          'Premium glossy paper: +$5.00',
          'Better photo quality',
          'More vibrant colors',
        );
        break;
      default:
        examples.push(`Base price: $${customization.customerPrice}`);
    }

    return examples;
  }
}
