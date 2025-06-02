import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import { ImageMetadata } from './schemas/image-metadata.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Image Metadata')
@Controller('metadata')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Get('media/:mediaId')
  @ApiOperation({ summary: 'Get metadata for a media file' })
  @ApiResponse({ status: 200, description: 'Metadata retrieved successfully' })
  async getByMediaId(@Param('mediaId') mediaId: string): Promise<ImageMetadata | null> {
    return this.metadataService.findByMediaId(mediaId);
  }

  @Post('analyze/:mediaId')
  @ApiOperation({ summary: 'Analyze and create metadata for a media file' })
  @ApiResponse({ status: 201, description: 'Metadata created successfully' })
  async analyzeMedia(
    @Param('mediaId') mediaId: string,
    @Body('imagePath') imagePath: string,
  ): Promise<ImageMetadata> {
    return this.metadataService.createFromAnalysis(mediaId, imagePath);
  }

  @Get('orientation/:orientation')
  @ApiOperation({ summary: 'Find images by orientation' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async findByOrientation(
    @Param('orientation') orientation: 'portrait' | 'landscape' | 'square',
  ): Promise<ImageMetadata[]> {
    return this.metadataService.findByOrientation(orientation);
  }

  @Get('aspect-ratio')
  @ApiOperation({ summary: 'Find images by aspect ratio range' })
  @ApiQuery({ name: 'min', type: 'number' })
  @ApiQuery({ name: 'max', type: 'number' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async findByAspectRatio(
    @Query('min') min: number,
    @Query('max') max: number,
  ): Promise<ImageMetadata[]> {
    return this.metadataService.findByAspectRatioRange(min, max);
  }

  @Get('color/:hex')
  @ApiOperation({ summary: 'Find images by dominant color' })
  @ApiQuery({ name: 'tolerance', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async findByColor(
    @Param('hex') hex: string,
    @Query('tolerance') tolerance?: number,
  ): Promise<ImageMetadata[]> {
    return this.metadataService.findByDominantColor(hex, tolerance);
  }

  @Get('quality')
  @ApiOperation({ summary: 'Find images by quality thresholds' })
  @ApiQuery({ name: 'sharpness', type: 'number', required: false })
  @ApiQuery({ name: 'brightness', type: 'number', required: false })
  @ApiQuery({ name: 'contrast', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async findByQuality(
    @Query('sharpness') sharpness?: number,
    @Query('brightness') brightness?: number,
    @Query('contrast') contrast?: number,
  ): Promise<ImageMetadata[]> {
    return this.metadataService.findByQualityThreshold(
      sharpness || 0,
      brightness || 0,
      contrast || 0,
    );
  }

  @Get('faces')
  @ApiOperation({ summary: 'Find images with detected faces' })
  @ApiResponse({ status: 200, description: 'Images with faces retrieved successfully' })
  async findWithFaces(): Promise<ImageMetadata[]> {
    return this.metadataService.findWithFaces();
  }

  @Get('layout/:layoutType')
  @ApiOperation({ summary: 'Find best images for a specific layout type' })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Best images for layout retrieved successfully' })
  async findBestForLayout(
    @Param('layoutType') layoutType: 'fullPage' | 'halfPage' | 'quarter' | 'collage',
    @Query('limit') limit?: number,
  ): Promise<ImageMetadata[]> {
    return this.metadataService.findBestForLayout(layoutType, limit || 10);
  }

  @Put('ai-tags/:mediaId')
  @ApiOperation({ summary: 'Update AI-generated tags for an image' })
  @ApiResponse({ status: 200, description: 'AI tags updated successfully' })
  async updateAiTags(
    @Param('mediaId') mediaId: string,
    @Body('tags') tags: string[],
  ): Promise<ImageMetadata> {
    return this.metadataService.updateAiTags(mediaId, tags);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get metadata statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(): Promise<any> {
    return this.metadataService.getStatistics();
  }
}
