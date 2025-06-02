import { Injectable } from '@nestjs/common';
import { LayoutTemplateService } from './layout-template.service';
import { MetadataService } from '../metadata/metadata.service';
import { ProjectService } from '../project/project.service';
import { LayoutTemplate, ImageSlot } from './schemas/layout-template.schema';
import { ImageMetadataDocument } from '../metadata/schemas/image-metadata.schema';
import { PageLayout } from '../project/schemas/project.schema';
import { ProductType } from '../common/schemas/product-size.schema';

export interface AutoLayoutOptions {
  projectId: string;
  imageIds: string[];
  productType: ProductType;
  preferredStyle?: 'minimal' | 'creative' | 'classic' | 'modern';
  allowMixedOrientation?: boolean;
  prioritizeFaces?: boolean;
  maxPagesPerTemplate?: number;
}

export interface LayoutSuggestion {
  templateId: string;
  template: LayoutTemplate;
  pages: PageLayout[];
  confidence: number;
  reasoning: string[];
}

@Injectable()
export class PageLayoutService {
  constructor(
    private templateService: LayoutTemplateService,
    private metadataService: MetadataService,
    private projectService: ProjectService,
  ) {}

  async generateAutoLayout(options: AutoLayoutOptions): Promise<LayoutSuggestion[]> {
    // Get image metadata for all images
    const imageMetadata = await this.metadataService.findByMediaIds(options.imageIds);

    if (imageMetadata.length === 0) {
      throw new Error('No image metadata found for provided images');
    }

    // Analyze image characteristics
    const imageAnalysis = this.analyzeImageCollection(imageMetadata);

    // Find suitable templates
    const templates = await this.findSuitableTemplates(options, imageAnalysis);

    // Generate layout suggestions
    const suggestions: LayoutSuggestion[] = [];

    for (const template of templates.slice(0, 3)) { // Top 3 templates
      const layoutSuggestion = await this.createLayoutSuggestion(
        template,
        imageMetadata,
        options,
        imageAnalysis
      );
      suggestions.push(layoutSuggestion);
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  async applyLayoutToProject(
    projectId: string,
    templateId: string,
    imageIds: string[],
    userId: string,
  ): Promise<void> {
    const template = await this.templateService.findById(templateId);
    const imageMetadata = await this.metadataService.findByMediaIds(imageIds);

    // Generate pages using the template
    this.distributeImagesAcrossPages(template, imageMetadata);

    // Update project with new layout
    const user = { _id: userId } as any; // Simplified for this context
    await this.projectService.update(projectId, {
      metadata: {
        autoLayoutApplied: true,
        lastAutoLayoutAt: new Date(),
      },
    } as any, user);

    // Note: In a real implementation, you'd update the project pages separately

    // Increment template usage
    await this.templateService.incrementUsage(templateId);
  }

  private analyzeImageCollection(metadata: ImageMetadataDocument[]): {
    orientationDistribution: { portrait: number; landscape: number; square: number };
    averageQuality: number;
    hasPortraits: boolean;
    dominantColors: string[];
    aspectRatios: number[];
    totalImages: number;
  } {
    const orientationCounts = { portrait: 0, landscape: 0, square: 0 };
    let totalQuality = 0;
    const colors: string[] = [];
    const aspectRatios: number[] = [];
    let hasPortraits = false;

    metadata.forEach(meta => {
      orientationCounts[meta.orientation]++;
      totalQuality += (meta.quality.sharpness + meta.quality.brightness + meta.quality.contrast) / 3;
      colors.push(meta.dominantColor.hex);
      aspectRatios.push(meta.aspectRatio);

      if (meta.faces && meta.faces.length > 0) {
        hasPortraits = true;
      }
    });

    return {
      orientationDistribution: {
        portrait: orientationCounts.portrait / metadata.length,
        landscape: orientationCounts.landscape / metadata.length,
        square: orientationCounts.square / metadata.length,
      },
      averageQuality: totalQuality / metadata.length,
      hasPortraits,
      dominantColors: [...new Set(colors)],
      aspectRatios,
      totalImages: metadata.length,
    };
  }

  private async findSuitableTemplates(
    options: AutoLayoutOptions,
    analysis: any,
  ): Promise<LayoutTemplate[]> {
    const { totalImages, orientationDistribution } = analysis;

    // Determine preferred orientation based on image collection
    let preferredOrientation: 'portrait' | 'landscape' | 'square' | 'mixed' = 'mixed';
    if (orientationDistribution.landscape > 0.7) preferredOrientation = 'landscape';
    else if (orientationDistribution.portrait > 0.7) preferredOrientation = 'portrait';
    else if (orientationDistribution.square > 0.7) preferredOrientation = 'square';

    // Get recommended templates
    const templates = await this.templateService.findRecommended(
      Math.min(totalImages, 6), // Most templates handle up to 6 images per page
      preferredOrientation,
      options.productType,
      10
    );

    // Filter by style preference if specified
    if (options.preferredStyle) {
      return templates.filter(template =>
        template.tags.includes(options.preferredStyle!) ||
        template.category.toLowerCase().includes(options.preferredStyle!)
      );
    }

    return templates;
  }

  private async createLayoutSuggestion(
    template: LayoutTemplate,
    imageMetadata: ImageMetadataDocument[],
    options: AutoLayoutOptions,
    analysis: any,
  ): Promise<LayoutSuggestion> {
    const pages = this.distributeImagesAcrossPages(template, imageMetadata);

    // Calculate confidence score
    const confidence = this.calculateConfidenceScore(template, analysis, options);

    // Generate reasoning
    const reasoning = this.generateReasoning(template, analysis, options);

    return {
      templateId: (template as any)._id.toString(),
      template,
      pages,
      confidence,
      reasoning,
    };
  }

  private distributeImagesAcrossPages(
    template: LayoutTemplate,
    imageMetadata: ImageMetadataDocument[],
  ): PageLayout[] {
    const pages: PageLayout[] = [];
    const imagesPerPage = template.imageCount;
    let imageIndex = 0;

    while (imageIndex < imageMetadata.length) {
      const pageImages = imageMetadata.slice(imageIndex, imageIndex + imagesPerPage);

      if (pageImages.length === 0) break;

      const page: PageLayout = {
        pageNumber: pages.length + 1,
        templateId: (template as any)._id.toString(),
        images: [],
        text: [],
      };

      // Assign images to slots based on best fit
      const sortedSlots = [...template.imageSlots].sort((a, b) => b.width * b.height - a.width * a.height);

      pageImages.forEach((imageMeta, index) => {
        if (index < sortedSlots.length) {
          const slot = sortedSlots[index];
          const bestFit = this.calculateImageFit(imageMeta, slot);

          page.images.push({
            imageId: imageMeta.mediaId.toString(),
            position: {
              x: slot.x,
              y: slot.y,
              width: slot.width,
              height: slot.height,
              rotation: bestFit.rotation,
            },
            effects: bestFit.effects,
          });
        }
      });

      // Add default text if template has text slots
      template.textSlots?.forEach(textSlot => {
        page.text?.push({
          content: textSlot.defaultText || '',
          position: {
            x: textSlot.x,
            y: textSlot.y,
            width: textSlot.width,
            height: textSlot.height,
          },
          style: {
            fontFamily: textSlot.fontFamily,
            fontSize: textSlot.fontSize,
            color: textSlot.color,
            fontWeight: textSlot.fontWeight,
            textAlign: textSlot.textAlign,
          },
        });
      });

      pages.push(page);
      imageIndex += imagesPerPage;
    }

    return pages;
  }

  private calculateImageFit(
    imageMeta: ImageMetadataDocument,
    slot: ImageSlot,
  ): { rotation: number; effects?: any } {
    const imageAspectRatio = imageMeta.aspectRatio;
    const slotAspectRatio = slot.width / slot.height;

    let rotation = 0;
    let effects = {};

    // Determine if rotation would improve fit
    const fitWithoutRotation = Math.abs(imageAspectRatio - slotAspectRatio);
    const fitWithRotation = Math.abs((1 / imageAspectRatio) - slotAspectRatio);

    if (fitWithRotation < fitWithoutRotation && fitWithRotation < 0.3) {
      rotation = 90;
    }

    // Apply quality-based effects
    if (imageMeta.quality.brightness < 40) {
      effects = { ...effects, brightness: 1.2 };
    }
    if (imageMeta.quality.contrast < 40) {
      effects = { ...effects, contrast: 1.1 };
    }

    return { rotation, effects: Object.keys(effects).length > 0 ? effects : undefined };
  }

  private calculateConfidenceScore(
    template: LayoutTemplate,
    analysis: any,
    options: AutoLayoutOptions,
  ): number {
    let score = 50; // Base score

    // Template popularity bonus
    score += Math.min(20, (template.usageCount || 0) / 100);

    // Rating bonus
    if (template.averageRating) {
      score += (template.averageRating - 3) * 5; // Scale 1-5 rating to -10 to +10
    }

    // Image count match
    const imageCountDiff = Math.abs(template.imageCount - analysis.totalImages);
    score += Math.max(0, 15 - imageCountDiff * 3);

    // Orientation match
    const dominantOrientation = Object.entries(analysis.orientationDistribution)
      .reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0] as string;

    if (template.preferredOrientation === dominantOrientation || template.preferredOrientation === 'mixed') {
      score += 10;
    }

    // Quality bonus
    if (analysis.averageQuality > 70) {
      score += 5;
    }

    // Face detection bonus
    if (options.prioritizeFaces && analysis.hasPortraits) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private generateReasoning(
    template: LayoutTemplate,
    analysis: any,
    _options: AutoLayoutOptions,
  ): string[] {
    const reasons: string[] = [];

    if (template.usageCount > 50) {
      reasons.push('Popular template with proven results');
    }

    if (template.averageRating && template.averageRating > 4) {
      reasons.push('Highly rated by users');
    }

    const dominantOrientation = Object.entries(analysis.orientationDistribution)
      .reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0] as string;

    if (template.preferredOrientation === dominantOrientation) {
      reasons.push(`Optimized for ${dominantOrientation} images`);
    }

    if (analysis.averageQuality > 70) {
      reasons.push('High-quality images detected - suitable for detailed layouts');
    }

    if (analysis.hasPortraits && template.imageSlots.some(slot => slot.width > slot.height)) {
      reasons.push('Portrait-friendly layout for photos with people');
    }

    if (template.difficulty === 'beginner') {
      reasons.push('Easy to customize and perfect for beginners');
    }

    return reasons;
  }
}
