import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { 
  TemplateManagerService, 
  TemplateSearchFilters,
  CreateTemplateRequest 
} from './template-manager.service';
import { Template, TemplateCategory, TemplateStyle } from './schemas/template.schema';
import { ProductType } from './schemas/canvas.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@ApiTags('Template Management')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplateController {
  constructor(private templateManager: TemplateManagerService) {}

  @Get('product/:productType')
  @ApiOperation({ summary: 'Get templates for specific product and size' })
  @ApiQuery({ name: 'width', type: 'number' })
  @ApiQuery({ name: 'height', type: 'number' })
  @ApiQuery({ name: 'orientation', enum: ['portrait', 'landscape'] })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  @ApiQuery({ name: 'style', enum: TemplateStyle, required: false })
  @ApiQuery({ name: 'featured', type: 'boolean', required: false })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplatesForProduct(
    @Param('productType') productType: ProductType,
    @Query('width') width: number,
    @Query('height') height: number,
    @Query('orientation') orientation: 'portrait' | 'landscape',
    @Query('category') category?: TemplateCategory,
    @Query('style') style?: TemplateStyle,
    @Query('featured') featured?: boolean,
  ): Promise<{
    templates: Template[];
    categories: TemplateCategory[];
    styles: TemplateStyle[];
    totalCount: number;
  }> {
    const filters: TemplateSearchFilters = {};
    if (category) filters.category = category;
    if (style) filters.style = style;
    if (featured) filters.featured = featured;

    return this.templateManager.getTemplatesForProduct(
      productType,
      { width: Number(width), height: Number(height), orientation },
      filters,
    );
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured templates' })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiResponse({ status: 200, description: 'Featured templates retrieved successfully' })
  async getFeaturedTemplates(
    @Query('productType') productType?: ProductType,
  ): Promise<Template[]> {
    return this.templateManager.getFeaturedTemplates(productType);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending templates' })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiResponse({ status: 200, description: 'Trending templates retrieved successfully' })
  async getTrendingTemplates(
    @Query('productType') productType?: ProductType,
  ): Promise<Template[]> {
    return this.templateManager.getTrendingTemplates(productType);
  }

  @Get('seasonal')
  @ApiOperation({ summary: 'Get seasonal templates' })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiResponse({ status: 200, description: 'Seasonal templates retrieved successfully' })
  async getSeasonalTemplates(
    @Query('productType') productType?: ProductType,
  ): Promise<Template[]> {
    return this.templateManager.getSeasonalTemplates(productType);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search templates' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  @ApiQuery({ name: 'style', enum: TemplateStyle, required: false })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchTemplates(
    @Query('q') searchTerm: string,
    @Query('productType') productType?: ProductType,
    @Query('category') category?: TemplateCategory,
    @Query('style') style?: TemplateStyle,
  ): Promise<Template[]> {
    const filters: TemplateSearchFilters = {};
    if (category) filters.category = category;
    if (style) filters.style = style;

    return this.templateManager.searchTemplates(searchTerm, productType, filters);
  }

  @Get(':templateId')
  @ApiOperation({ summary: 'Get template details' })
  @ApiResponse({ status: 200, description: 'Template details retrieved successfully' })
  async getTemplate(@Param('templateId') templateId: string): Promise<Template> {
    return this.templateManager.getTemplate(templateId);
  }

  @Post(':templateId/rate')
  @ApiOperation({ summary: 'Rate a template' })
  @ApiResponse({ status: 200, description: 'Template rated successfully' })
  async rateTemplate(
    @Param('templateId') templateId: string,
    @Body() ratingData: { rating: number },
  ): Promise<Template> {
    return this.templateManager.rateTemplate(templateId, ratingData.rating);
  }

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new template (Admin only)' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Body() request: CreateTemplateRequest): Promise<Template> {
    return this.templateManager.createTemplate(request);
  }

  @Post('create-from-indesign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create template from Adobe InDesign export (Admin only)' })
  @ApiResponse({ status: 201, description: 'Template created from InDesign successfully' })
  async createFromInDesign(
    @Body() indesignData: {
      name: string;
      category: TemplateCategory;
      style: TemplateStyle;
      indesignFile: string;
      exportedCanvases: any[];
      previews: any;
    },
  ): Promise<Template> {
    return this.templateManager.createPhotoBookTemplateFromInDesign(indesignData);
  }

  // Example endpoints for testing
  @Post('examples/wedding-photo-book')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Example: Create wedding photo book template' })
  @ApiResponse({ status: 201, description: 'Wedding template created successfully' })
  async createWeddingTemplate(): Promise<{
    message: string;
    template: Template;
    usage: string[];
  }> {
    const template = await this.templateManager.createTemplate({
      name: 'Elegant Wedding Photo Book',
      description: 'Beautiful wedding photo book template with elegant typography and romantic layouts',
      productType: ProductType.PHOTO_BOOK,
      category: TemplateCategory.WEDDING,
      style: TemplateStyle.ELEGANT,
      dimensions: {
        width: 2400,
        height: 2400,
        orientation: 'portrait',
        pageCount: 20,
      },
      canvases: [
        {
          canvasType: 'COVER',
          name: 'Front Cover',
          order: 1,
          dimensions: {
            width: 2400,
            height: 2400,
            unit: 'px',
            dpi: 300,
            bleed: 3,
            safeZone: 5,
            orientation: 'portrait',
          },
          background: {
            type: 'color',
            color: '#f8f8f8',
          },
          elements: [
            {
              id: 'cover_image_placeholder',
              type: 'IMAGE',
              name: 'Main Photo',
              position: { x: 200, y: 200, z: 1 },
              size: { width: 2000, height: 1500 },
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              isPlaceholder: true,
              placeholderType: 'image',
              placeholderText: 'Add your wedding photo here',
            },
            {
              id: 'cover_title_placeholder',
              type: 'TEXT',
              name: 'Wedding Title',
              position: { x: 200, y: 1800, z: 2 },
              size: { width: 2000, height: 200 },
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              isPlaceholder: true,
              placeholderType: 'text',
              placeholderText: 'Your Names Here',
              text: {
                content: 'Your Names Here',
                fontFamily: 'Playfair Display',
                fontSize: 48,
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#2c3e50',
                align: 'center',
                lineHeight: 1.2,
                letterSpacing: 2,
                textDecoration: 'none',
              },
            },
          ],
        },
        {
          canvasType: 'SPREAD',
          name: 'Pages 1-2',
          order: 2,
          dimensions: {
            width: 4800,
            height: 2400,
            unit: 'px',
            dpi: 300,
            bleed: 3,
            safeZone: 5,
            orientation: 'landscape',
          },
          background: {
            type: 'color',
            color: '#ffffff',
          },
          elements: [
            {
              id: 'spread_image_1',
              type: 'IMAGE',
              name: 'Photo 1',
              position: { x: 100, y: 100, z: 1 },
              size: { width: 1000, height: 800 },
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              isPlaceholder: true,
              placeholderType: 'image',
            },
            {
              id: 'spread_image_2',
              type: 'IMAGE',
              name: 'Photo 2',
              position: { x: 2500, y: 100, z: 1 },
              size: { width: 1000, height: 800 },
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              isPlaceholder: true,
              placeholderType: 'image',
            },
          ],
        },
      ],
      previews: {
        thumbnail: '/templates/wedding-elegant/thumbnail.jpg',
        preview: '/templates/wedding-elegant/preview.jpg',
        fullPreview: '/templates/wedding-elegant/full-preview.jpg',
        mockup: '/templates/wedding-elegant/mockup.jpg',
      },
      pricing: {
        isPremium: false,
        price: 0,
      },
      metadata: {
        tags: ['wedding', 'elegant', 'romantic', 'classic'],
        colors: ['#f8f8f8', '#2c3e50', '#ffffff'],
        difficulty: 'easy',
        designerName: 'Frametale Design Team',
      },
      indesign: {
        indesignFile: '/indesign/wedding-elegant.indd',
        indesignVersion: 'CC 2024',
        fonts: ['Playfair Display', 'Source Sans Pro'],
      },
    });

    return {
      message: 'Wedding photo book template created successfully',
      template,
      usage: [
        'This template will show when customers select 8x8 photo book size',
        'Customers can replace placeholder images with their wedding photos',
        'Text placeholders can be customized with their names and details',
        'Template maintains elegant design while allowing personalization',
      ],
    };
  }

  @Get('examples/8x8-templates')
  @ApiOperation({ summary: 'Example: Get templates for 8x8 photo book' })
  @ApiResponse({ status: 200, description: 'Templates for 8x8 photo book retrieved' })
  async get8x8Templates(): Promise<{
    message: string;
    productInfo: any;
    templates: Template[];
    explanation: string[];
  }> {
    const templates = await this.templateManager.getTemplatesForProduct(
      ProductType.PHOTO_BOOK,
      { width: 2400, height: 2400, orientation: 'portrait' },
    );

    return {
      message: 'Templates for 8x8 photo book',
      productInfo: {
        productType: 'PHOTO_BOOK',
        size: '8x8 inches',
        dimensions: { width: 2400, height: 2400 },
        dpi: 300,
        orientation: 'portrait',
      },
      templates: templates.templates,
      explanation: [
        'These templates are specifically designed for 8x8 photo books',
        'All templates match the selected dimensions (2400x2400px at 300 DPI)',
        'Templates include placeholders for easy customization',
        'Customers can choose from different categories and styles',
        `Found ${templates.totalCount} templates available`,
      ],
    };
  }
}
