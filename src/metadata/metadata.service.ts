import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImageMetadata, ImageMetadataDocument } from './schemas/image-metadata.schema';
import { ImageAnalyzerService, ImageAnalysis } from '../image-analyzer/image-analyzer.service';

@Injectable()
export class MetadataService {
  constructor(
    @InjectModel(ImageMetadata.name) private metadataModel: Model<ImageMetadataDocument>,
    private imageAnalyzerService: ImageAnalyzerService,
  ) {}

  async createFromAnalysis(mediaId: string, imagePath: string): Promise<ImageMetadata> {
    // Check if metadata already exists
    const existing = await this.metadataModel.findOne({ mediaId }).exec();
    if (existing) {
      return existing;
    }

    // Analyze the image
    const analysis = await this.imageAnalyzerService.analyzeImage(imagePath);

    // Calculate layout suitability scores
    const layoutSuitability = this.calculateLayoutSuitability(analysis);

    // Create metadata record
    const metadata = new this.metadataModel({
      mediaId: new Types.ObjectId(mediaId),
      orientation: analysis.orientation,
      aspectRatio: analysis.aspectRatio,
      dimensions: analysis.dimensions,
      exifData: analysis.exifData,
      dominantColor: analysis.dominantColor,
      colorPalette: analysis.colorPalette,
      quality: analysis.quality,
      faces: analysis.faces,
      layoutSuitability,
    });

    return metadata.save();
  }

  async findByMediaId(mediaId: string): Promise<ImageMetadataDocument | null> {
    return this.metadataModel.findOne({ mediaId }).exec();
  }

  async findByMediaIds(mediaIds: string[]): Promise<ImageMetadataDocument[]> {
    const objectIds = mediaIds.map(id => new Types.ObjectId(id));
    return this.metadataModel.find({ mediaId: { $in: objectIds } }).exec();
  }

  async updateAiTags(mediaId: string, aiTags: string[]): Promise<ImageMetadata> {
    const metadata = await this.metadataModel.findOne({ mediaId }).exec();
    if (!metadata) {
      throw new NotFoundException('Metadata not found');
    }

    metadata.aiTags = aiTags;
    return metadata.save();
  }

  async findByOrientation(orientation: 'portrait' | 'landscape' | 'square'): Promise<ImageMetadataDocument[]> {
    return this.metadataModel.find({ orientation }).exec();
  }

  async findByAspectRatioRange(minRatio: number, maxRatio: number): Promise<ImageMetadataDocument[]> {
    return this.metadataModel.find({
      aspectRatio: { $gte: minRatio, $lte: maxRatio }
    }).exec();
  }

  async findByDominantColor(colorHex: string, tolerance: number = 30): Promise<ImageMetadataDocument[]> {
    // Convert hex to RGB for comparison
    const targetRgb = this.hexToRgb(colorHex);
    if (!targetRgb) return [];

    // Find images with similar dominant colors
    // This is a simplified approach - in production, you might want to use color distance algorithms
    const allMetadata = await this.metadataModel.find().exec();
    
    return allMetadata.filter(metadata => {
      const { r, g, b } = metadata.dominantColor.rgb;
      const distance = Math.sqrt(
        Math.pow(r - targetRgb.r, 2) +
        Math.pow(g - targetRgb.g, 2) +
        Math.pow(b - targetRgb.b, 2)
      );
      return distance <= tolerance;
    });
  }

  async findByQualityThreshold(minSharpness: number = 0, minBrightness: number = 0, minContrast: number = 0): Promise<ImageMetadataDocument[]> {
    return this.metadataModel.find({
      'quality.sharpness': { $gte: minSharpness },
      'quality.brightness': { $gte: minBrightness },
      'quality.contrast': { $gte: minContrast },
    }).exec();
  }

  async findWithFaces(): Promise<ImageMetadataDocument[]> {
    return this.metadataModel.find({
      faces: { $exists: true, $not: { $size: 0 } }
    }).exec();
  }

  async findBestForLayout(layoutType: 'fullPage' | 'halfPage' | 'quarter' | 'collage', limit: number = 10): Promise<ImageMetadataDocument[]> {
    const sortField = `layoutSuitability.${layoutType}`;
    return this.metadataModel
      .find({ [sortField]: { $exists: true } })
      .sort({ [sortField]: -1 })
      .limit(limit)
      .exec();
  }

  async getStatistics(): Promise<{
    totalImages: number;
    orientationBreakdown: { portrait: number; landscape: number; square: number };
    averageQuality: { sharpness: number; brightness: number; contrast: number };
    imagesWithFaces: number;
    commonAspectRatios: Array<{ ratio: number; count: number }>;
  }> {
    const totalImages = await this.metadataModel.countDocuments().exec();
    
    // Orientation breakdown
    const orientationBreakdown = {
      portrait: await this.metadataModel.countDocuments({ orientation: 'portrait' }).exec(),
      landscape: await this.metadataModel.countDocuments({ orientation: 'landscape' }).exec(),
      square: await this.metadataModel.countDocuments({ orientation: 'square' }).exec(),
    };

    // Average quality
    const qualityAgg = await this.metadataModel.aggregate([
      {
        $group: {
          _id: null,
          avgSharpness: { $avg: '$quality.sharpness' },
          avgBrightness: { $avg: '$quality.brightness' },
          avgContrast: { $avg: '$quality.contrast' },
        }
      }
    ]).exec();

    const averageQuality = qualityAgg[0] ? {
      sharpness: Math.round(qualityAgg[0].avgSharpness),
      brightness: Math.round(qualityAgg[0].avgBrightness),
      contrast: Math.round(qualityAgg[0].avgContrast),
    } : { sharpness: 0, brightness: 0, contrast: 0 };

    // Images with faces
    const imagesWithFaces = await this.metadataModel.countDocuments({
      faces: { $exists: true, $not: { $size: 0 } }
    }).exec();

    // Common aspect ratios
    const aspectRatioAgg = await this.metadataModel.aggregate([
      {
        $group: {
          _id: { $round: ['$aspectRatio', 2] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).exec();

    const commonAspectRatios = aspectRatioAgg.map(item => ({
      ratio: item._id,
      count: item.count
    }));

    return {
      totalImages,
      orientationBreakdown,
      averageQuality,
      imagesWithFaces,
      commonAspectRatios,
    };
  }

  private calculateLayoutSuitability(analysis: ImageAnalysis): {
    fullPage: number;
    halfPage: number;
    quarter: number;
    collage: number;
  } {
    const { orientation, quality, aspectRatio, faces } = analysis;
    
    // Base scores
    let fullPage = 50;
    let halfPage = 50;
    let quarter = 50;
    let collage = 50;

    // Orientation bonuses
    if (orientation === 'landscape') {
      fullPage += 20;
      halfPage += 10;
    } else if (orientation === 'portrait') {
      halfPage += 15;
      quarter += 10;
    } else { // square
      collage += 20;
      quarter += 15;
    }

    // Quality bonuses
    const avgQuality = (quality.sharpness + quality.brightness + quality.contrast) / 3;
    const qualityBonus = Math.round(avgQuality * 0.3);
    fullPage += qualityBonus;
    halfPage += qualityBonus * 0.8;
    quarter += qualityBonus * 0.6;
    collage += qualityBonus * 0.4;

    // Aspect ratio considerations
    if (aspectRatio >= 1.3 && aspectRatio <= 1.8) { // Good for full page
      fullPage += 15;
    }
    if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { // Good for square layouts
      quarter += 10;
      collage += 15;
    }

    // Face detection bonus for certain layouts
    if (faces && faces.length > 0) {
      fullPage += 10;
      halfPage += 15;
      if (faces.length > 1) {
        collage += 20;
      }
    }

    // Ensure scores are within 0-100 range
    return {
      fullPage: Math.min(100, Math.max(0, fullPage)),
      halfPage: Math.min(100, Math.max(0, halfPage)),
      quarter: Math.min(100, Math.max(0, quarter)),
      collage: Math.min(100, Math.max(0, collage)),
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
