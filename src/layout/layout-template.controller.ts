import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LayoutTemplateService, TemplateFilter } from './layout-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { LayoutTemplate } from './schemas/layout-template.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { ProductType } from '../common/schemas/product-size.schema';

@ApiTags('Layout Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LayoutTemplateController {
  constructor(private templateService: LayoutTemplateService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new layout template (Admin only)' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@Body() createTemplateDto: CreateTemplateDto): Promise<LayoutTemplate> {
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates with optional filtering' })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiQuery({ name: 'category', type: 'string', required: false })
  @ApiQuery({ name: 'tags', type: 'string', required: false, description: 'Comma-separated tags' })
  @ApiQuery({ name: 'imageCount', type: 'number', required: false })
  @ApiQuery({ name: 'minImageCount', type: 'number', required: false })
  @ApiQuery({ name: 'maxImageCount', type: 'number', required: false })
  @ApiQuery({ name: 'preferredOrientation', enum: ['portrait', 'landscape', 'square', 'mixed'], required: false })
  @ApiQuery({ name: 'difficulty', enum: ['beginner', 'intermediate', 'advanced'], required: false })
  @ApiQuery({ name: 'isPremium', type: 'boolean', required: false })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(
    @Query('productType') productType?: ProductType,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('imageCount') imageCount?: number,
    @Query('minImageCount') minImageCount?: number,
    @Query('maxImageCount') maxImageCount?: number,
    @Query('preferredOrientation') preferredOrientation?: 'portrait' | 'landscape' | 'square' | 'mixed',
    @Query('difficulty') difficulty?: 'beginner' | 'intermediate' | 'advanced',
    @Query('isPremium') isPremium?: boolean,
  ): Promise<LayoutTemplate[]> {
    const filter: TemplateFilter = {
      productType,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
      imageCount,
      minImageCount,
      maxImageCount,
      preferredOrientation,
      difficulty,
      isPremium,
      isActive: true,
    };

    return this.templateService.findAll(filter);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular templates' })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiResponse({ status: 200, description: 'Popular templates retrieved successfully' })
  async findPopular(
    @Query('limit') limit?: number,
    @Query('productType') productType?: ProductType,
  ): Promise<LayoutTemplate[]> {
    return this.templateService.findPopular(limit, productType);
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended templates based on criteria' })
  @ApiQuery({ name: 'imageCount', type: 'number', required: true })
  @ApiQuery({ name: 'preferredOrientation', enum: ['portrait', 'landscape', 'square', 'mixed'], required: true })
  @ApiQuery({ name: 'productType', enum: ProductType, required: true })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Recommended templates retrieved successfully' })
  async findRecommended(
    @Query('imageCount') imageCount: number,
    @Query('preferredOrientation') preferredOrientation: 'portrait' | 'landscape' | 'square' | 'mixed',
    @Query('productType') productType: ProductType,
    @Query('limit') limit?: number,
  ): Promise<LayoutTemplate[]> {
    return this.templateService.findRecommended(imageCount, preferredOrientation, productType, limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all template categories' })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(@Query('productType') productType?: ProductType): Promise<string[]> {
    return this.templateService.getCategories(productType);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all template tags' })
  @ApiQuery({ name: 'productType', enum: ProductType, required: false })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getTags(@Query('productType') productType?: ProductType): Promise<string[]> {
    return this.templateService.getTags(productType);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get template statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(): Promise<any> {
    return this.templateService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findById(@Param('id') id: string): Promise<LayoutTemplate> {
    return this.templateService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update template (Admin only)' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<LayoutTemplate>,
  ): Promise<LayoutTemplate> {
    return this.templateService.update(id, updateData);
  }

  @Put(':id/usage')
  @ApiOperation({ summary: 'Increment template usage count' })
  @ApiResponse({ status: 200, description: 'Usage count updated successfully' })
  async incrementUsage(@Param('id') id: string): Promise<{ message: string }> {
    await this.templateService.incrementUsage(id);
    return { message: 'Usage count updated successfully' };
  }

  @Put(':id/rating')
  @ApiOperation({ summary: 'Update template rating' })
  @ApiResponse({ status: 200, description: 'Rating updated successfully' })
  async updateRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
  ): Promise<LayoutTemplate> {
    return this.templateService.updateRating(id, rating);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete template (Admin only)' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.templateService.delete(id);
    return { message: 'Template deleted successfully' };
  }
}
