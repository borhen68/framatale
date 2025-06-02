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
  PrintOnDemandPricingService, 
  SupplierPriceRequest, 
  PriceCalculation,
  SupplierComparison 
} from './print-on-demand-pricing.service';
import { SupplierProduct, SupplierType } from './schemas/supplier-product.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@ApiTags('Print-on-Demand Pricing')
@Controller('pricing/print-on-demand')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrintOnDemandController {
  constructor(private podPricingService: PrintOnDemandPricingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate price for print-on-demand product' })
  @ApiResponse({ status: 200, description: 'Price calculated successfully' })
  async calculatePrice(@Body() request: SupplierPriceRequest): Promise<PriceCalculation> {
    return this.podPricingService.calculatePrice(request);
  }

  @Post('compare-suppliers')
  @ApiOperation({ summary: 'Compare prices across all suppliers' })
  @ApiResponse({ status: 200, description: 'Supplier comparison completed' })
  async compareSuppliers(@Body() request: SupplierPriceRequest): Promise<SupplierComparison[]> {
    return this.podPricingService.compareSuppliers(request);
  }

  @Post('products')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add new supplier product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product added successfully' })
  async addSupplierProduct(
    @Body() productData: {
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
    },
  ): Promise<SupplierProduct> {
    return this.podPricingService.addSupplierProduct(productData);
  }

  @Post('products/photo-book/setup')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Quick setup: Add photo book from Printful (Admin only)' })
  @ApiResponse({ status: 201, description: 'Photo book product added successfully' })
  async setupPhotoBook(): Promise<SupplierProduct> {
    return this.podPricingService.addPhotoBookFromPrintful();
  }

  @Put('products/:productType/:variant/:supplier/markup')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update product markup (Admin only)' })
  @ApiResponse({ status: 200, description: 'Markup updated successfully' })
  async updateMarkup(
    @Param('productType') productType: string,
    @Param('variant') variant: string,
    @Param('supplier') supplier: SupplierType,
    @Body() updateData: {
      newMarkup: number;
      markupType: 'amount' | 'percentage';
    },
  ): Promise<SupplierProduct> {
    return this.podPricingService.updateMarkup(
      productType,
      variant,
      supplier,
      updateData.newMarkup,
      updateData.markupType,
    );
  }

  @Post('sync/:supplier')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync prices from supplier API (Admin only)' })
  @ApiResponse({ status: 200, description: 'Prices synced successfully' })
  async syncSupplierPrices(@Param('supplier') supplier: SupplierType): Promise<{
    updated: number;
    errors: string[];
  }> {
    return this.podPricingService.syncSupplierPrices(supplier);
  }

  @Get('profit-report')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get profit report (Admin only)' })
  @ApiQuery({ name: 'startDate', type: 'string' })
  @ApiQuery({ name: 'endDate', type: 'string' })
  @ApiResponse({ status: 200, description: 'Profit report generated successfully' })
  async getProfitReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.podPricingService.getProfitReport({
      start: new Date(startDate),
      end: new Date(endDate),
    });
  }

  // Quick examples for your specific use case
  @Post('examples/photo-book-pricing')
  @ApiOperation({ summary: 'Example: Calculate photo book pricing ($4 cost → $22 selling)' })
  @ApiResponse({ status: 200, description: 'Example pricing calculated' })
  async examplePhotoBookPricing(): Promise<{
    example: string;
    calculation: PriceCalculation;
    explanation: string[];
  }> {
    const calculation = await this.podPricingService.calculatePrice({
      productType: 'photo_book',
      variant: '8x8_hardcover',
      quantity: 1,
    });

    return {
      example: 'Photo Book: $4 supplier cost → $22 your price',
      calculation,
      explanation: [
        `Supplier (Printful) charges: $${calculation.supplierPrice}`,
        `You sell for: $${calculation.yourPrice}`,
        `Your profit per book: $${calculation.profit}`,
        `Markup percentage: ${calculation.markupPercentage.toFixed(1)}%`,
        `Profit margin: ${calculation.marginPercentage.toFixed(1)}%`,
        'Supplier handles printing, shipping, and fulfillment',
        'You just collect the profit difference!',
      ],
    };
  }

  @Get('markup-calculator')
  @ApiOperation({ summary: 'Markup calculator tool' })
  @ApiQuery({ name: 'supplierPrice', type: 'number' })
  @ApiQuery({ name: 'sellingPrice', type: 'number', required: false })
  @ApiQuery({ name: 'markupAmount', type: 'number', required: false })
  @ApiQuery({ name: 'markupPercentage', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Markup calculated' })
  async calculateMarkup(
    @Query('supplierPrice') supplierPrice: number,
    @Query('sellingPrice') sellingPrice?: number,
    @Query('markupAmount') markupAmount?: number,
    @Query('markupPercentage') markupPercentage?: number,
  ): Promise<{
    supplierPrice: number;
    sellingPrice: number;
    markupAmount: number;
    markupPercentage: number;
    marginPercentage: number;
    examples: string[];
  }> {
    let finalSellingPrice: number;
    let finalMarkupAmount: number;

    if (sellingPrice) {
      // Calculate from selling price
      finalSellingPrice = sellingPrice;
      finalMarkupAmount = sellingPrice - supplierPrice;
    } else if (markupAmount) {
      // Calculate from markup amount
      finalMarkupAmount = markupAmount;
      finalSellingPrice = supplierPrice + markupAmount;
    } else if (markupPercentage) {
      // Calculate from markup percentage
      finalMarkupAmount = supplierPrice * (markupPercentage / 100);
      finalSellingPrice = supplierPrice + finalMarkupAmount;
    } else {
      throw new Error('Provide either sellingPrice, markupAmount, or markupPercentage');
    }

    const finalMarkupPercentage = (finalMarkupAmount / supplierPrice) * 100;
    const finalMarginPercentage = (finalMarkupAmount / finalSellingPrice) * 100;

    return {
      supplierPrice,
      sellingPrice: finalSellingPrice,
      markupAmount: finalMarkupAmount,
      markupPercentage: finalMarkupPercentage,
      marginPercentage: finalMarginPercentage,
      examples: [
        `If supplier charges $${supplierPrice}`,
        `And you sell for $${finalSellingPrice}`,
        `Your profit is $${finalMarkupAmount} per item`,
        `That's a ${finalMarkupPercentage.toFixed(1)}% markup`,
        `And a ${finalMarginPercentage.toFixed(1)}% profit margin`,
        `On 100 items, you'd make $${(finalMarkupAmount * 100).toFixed(2)} profit`,
      ],
    };
  }
}
