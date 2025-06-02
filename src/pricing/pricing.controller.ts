import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PricingEngineService, PricingRequest, PricingResult } from './pricing-engine.service';
import { PricingRuleService } from './pricing-rule.service';
import { PricingRule } from './schemas/pricing-rule.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDocument, UserRole } from '../user/schemas/user.schema';

@ApiTags('Pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PricingController {
  constructor(
    private pricingEngine: PricingEngineService,
    private pricingRuleService: PricingRuleService,
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate price for a product' })
  @ApiResponse({ status: 200, description: 'Price calculated successfully' })
  async calculatePrice(
    @Body() request: PricingRequest,
    @CurrentUser() user: UserDocument,
  ): Promise<PricingResult> {
    // Enrich request with user information
    const enrichedRequest: PricingRequest = {
      ...request,
      userId: (user._id as any).toString(),
      userSegment: user.role === UserRole.ADMIN ? 'admin' : 'customer',
      timestamp: new Date(),
    };

    return this.pricingEngine.calculatePrice(enrichedRequest);
  }

  @Post('quote')
  @ApiOperation({ summary: 'Generate a detailed price quote' })
  @ApiResponse({ status: 200, description: 'Quote generated successfully' })
  async generateQuote(
    @Body() request: {
      items: Array<{
        productType: string;
        quantity: number;
        customizations?: Record<string, any>;
      }>;
      shippingAddress?: {
        country: string;
        state: string;
        city: string;
      };
      promoCode?: string;
    },
    @CurrentUser() user: UserDocument,
  ): Promise<{
    items: Array<PricingResult & { productType: string; quantity: number }>;
    totals: {
      subtotal: number;
      totalDiscounts: number;
      totalTaxes: number;
      totalShipping: number;
      grandTotal: number;
    };
    validUntil: Date;
    quoteId: string;
  }> {
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const items: Array<PricingResult & { productType: string; quantity: number }> = [];
    let totals = {
      subtotal: 0,
      totalDiscounts: 0,
      totalTaxes: 0,
      totalShipping: 0,
      grandTotal: 0,
    };

    for (const item of request.items) {
      const pricingRequest: PricingRequest = {
        productType: item.productType,
        quantity: item.quantity,
        userId: (user._id as any).toString(),
        userSegment: user.role === UserRole.ADMIN ? 'admin' : 'customer',
        region: request.shippingAddress?.country || 'US',
        timestamp: new Date(),
      };

      const pricing = await this.pricingEngine.calculatePrice(pricingRequest);
      
      items.push({
        ...pricing,
        productType: item.productType,
        quantity: item.quantity,
      });

      totals.subtotal += pricing.breakdown.subtotal;
      totals.totalDiscounts += pricing.breakdown.totalDiscounts;
      totals.totalTaxes += pricing.breakdown.totalTaxes;
      totals.totalShipping += pricing.breakdown.totalShipping;
      totals.grandTotal += pricing.breakdown.grandTotal;
    }

    return {
      items,
      totals,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      quoteId,
    };
  }

  @Get('rules')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all pricing rules (Admin only)' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'scope', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiResponse({ status: 200, description: 'Pricing rules retrieved successfully' })
  async getPricingRules(
    @Query('type') type?: string,
    @Query('scope') scope?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<PricingRule[]> {
    return this.pricingRuleService.getRules({ type, scope, isActive });
  }

  @Post('rules')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create pricing rule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Pricing rule created successfully' })
  async createPricingRule(
    @Body() ruleData: Partial<PricingRule>,
    @CurrentUser() user: UserDocument,
  ): Promise<PricingRule> {
    return this.pricingRuleService.createRule({
      ...ruleData,
      metadata: {
        createdBy: (user._id as any).toString(),
        approvedBy: undefined,
        version: 1,
        tags: ruleData.metadata?.tags || [],
        businessReason: ruleData.metadata?.businessReason || '',
        ...ruleData.metadata,
      },
    });
  }

  @Put('rules/:ruleId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update pricing rule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pricing rule updated successfully' })
  async updatePricingRule(
    @Param('ruleId') ruleId: string,
    @Body() updates: Partial<PricingRule>,
    @CurrentUser() user: UserDocument,
  ): Promise<PricingRule> {
    return this.pricingRuleService.updateRule(ruleId, {
      ...updates,
      metadata: {
        createdBy: updates.metadata?.createdBy || '',
        approvedBy: updates.metadata?.approvedBy,
        version: (updates.metadata?.version || 0) + 1,
        tags: updates.metadata?.tags || [],
        businessReason: updates.metadata?.businessReason || '',
        ...updates.metadata,
      },
    });
  }

  @Delete('rules/:ruleId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete pricing rule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pricing rule deleted successfully' })
  async deletePricingRule(@Param('ruleId') ruleId: string): Promise<{ message: string }> {
    await this.pricingRuleService.deleteRule(ruleId);
    return { message: 'Pricing rule deleted successfully' };
  }

  @Post('rules/:ruleId/test')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test pricing rule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pricing rule tested successfully' })
  async testPricingRule(
    @Param('ruleId') ruleId: string,
    @Body() testRequest: PricingRequest,
  ): Promise<{
    originalPrice: PricingResult;
    testPrice: PricingResult;
    difference: {
      amount: number;
      percentage: number;
    };
  }> {
    return this.pricingRuleService.testRule(ruleId, testRequest);
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pricing analytics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: 'string' })
  @ApiQuery({ name: 'endDate', type: 'string' })
  @ApiResponse({ status: 200, description: 'Pricing analytics retrieved successfully' })
  async getPricingAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.pricingRuleService.getAnalytics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Post('optimize')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pricing optimization recommendations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Optimization recommendations generated' })
  async getPricingOptimization(
    @Body() request: {
      productType: string;
      timeRange: { start: Date; end: Date };
      goals: Array<'revenue' | 'volume' | 'margin' | 'market_share'>;
    },
  ): Promise<{
    currentPerformance: any;
    recommendations: Array<{
      type: string;
      description: string;
      expectedImpact: {
        revenue: number;
        volume: number;
        margin: number;
      };
      confidence: number;
    }>;
  }> {
    return this.pricingRuleService.getOptimizationRecommendations(request);
  }
}
