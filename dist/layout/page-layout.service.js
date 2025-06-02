"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLayoutService = void 0;
const common_1 = require("@nestjs/common");
const layout_template_service_1 = require("./layout-template.service");
const metadata_service_1 = require("../metadata/metadata.service");
const project_service_1 = require("../project/project.service");
let PageLayoutService = class PageLayoutService {
    templateService;
    metadataService;
    projectService;
    constructor(templateService, metadataService, projectService) {
        this.templateService = templateService;
        this.metadataService = metadataService;
        this.projectService = projectService;
    }
    async generateAutoLayout(options) {
        const imageMetadata = await this.metadataService.findByMediaIds(options.imageIds);
        if (imageMetadata.length === 0) {
            throw new Error('No image metadata found for provided images');
        }
        const imageAnalysis = this.analyzeImageCollection(imageMetadata);
        const templates = await this.findSuitableTemplates(options, imageAnalysis);
        const suggestions = [];
        for (const template of templates.slice(0, 3)) {
            const layoutSuggestion = await this.createLayoutSuggestion(template, imageMetadata, options, imageAnalysis);
            suggestions.push(layoutSuggestion);
        }
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    async applyLayoutToProject(projectId, templateId, imageIds, userId) {
        const template = await this.templateService.findById(templateId);
        const imageMetadata = await this.metadataService.findByMediaIds(imageIds);
        this.distributeImagesAcrossPages(template, imageMetadata);
        const user = { _id: userId };
        await this.projectService.update(projectId, {
            metadata: {
                autoLayoutApplied: true,
                lastAutoLayoutAt: new Date(),
            },
        }, user);
        await this.templateService.incrementUsage(templateId);
    }
    analyzeImageCollection(metadata) {
        const orientationCounts = { portrait: 0, landscape: 0, square: 0 };
        let totalQuality = 0;
        const colors = [];
        const aspectRatios = [];
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
    async findSuitableTemplates(options, analysis) {
        const { totalImages, orientationDistribution } = analysis;
        let preferredOrientation = 'mixed';
        if (orientationDistribution.landscape > 0.7)
            preferredOrientation = 'landscape';
        else if (orientationDistribution.portrait > 0.7)
            preferredOrientation = 'portrait';
        else if (orientationDistribution.square > 0.7)
            preferredOrientation = 'square';
        const templates = await this.templateService.findRecommended(Math.min(totalImages, 6), preferredOrientation, options.productType, 10);
        if (options.preferredStyle) {
            return templates.filter(template => template.tags.includes(options.preferredStyle) ||
                template.category.toLowerCase().includes(options.preferredStyle));
        }
        return templates;
    }
    async createLayoutSuggestion(template, imageMetadata, options, analysis) {
        const pages = this.distributeImagesAcrossPages(template, imageMetadata);
        const confidence = this.calculateConfidenceScore(template, analysis, options);
        const reasoning = this.generateReasoning(template, analysis, options);
        return {
            templateId: template._id.toString(),
            template,
            pages,
            confidence,
            reasoning,
        };
    }
    distributeImagesAcrossPages(template, imageMetadata) {
        const pages = [];
        const imagesPerPage = template.imageCount;
        let imageIndex = 0;
        while (imageIndex < imageMetadata.length) {
            const pageImages = imageMetadata.slice(imageIndex, imageIndex + imagesPerPage);
            if (pageImages.length === 0)
                break;
            const page = {
                pageNumber: pages.length + 1,
                templateId: template._id.toString(),
                images: [],
                text: [],
            };
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
    calculateImageFit(imageMeta, slot) {
        const imageAspectRatio = imageMeta.aspectRatio;
        const slotAspectRatio = slot.width / slot.height;
        let rotation = 0;
        let effects = {};
        const fitWithoutRotation = Math.abs(imageAspectRatio - slotAspectRatio);
        const fitWithRotation = Math.abs((1 / imageAspectRatio) - slotAspectRatio);
        if (fitWithRotation < fitWithoutRotation && fitWithRotation < 0.3) {
            rotation = 90;
        }
        if (imageMeta.quality.brightness < 40) {
            effects = { ...effects, brightness: 1.2 };
        }
        if (imageMeta.quality.contrast < 40) {
            effects = { ...effects, contrast: 1.1 };
        }
        return { rotation, effects: Object.keys(effects).length > 0 ? effects : undefined };
    }
    calculateConfidenceScore(template, analysis, options) {
        let score = 50;
        score += Math.min(20, (template.usageCount || 0) / 100);
        if (template.averageRating) {
            score += (template.averageRating - 3) * 5;
        }
        const imageCountDiff = Math.abs(template.imageCount - analysis.totalImages);
        score += Math.max(0, 15 - imageCountDiff * 3);
        const dominantOrientation = Object.entries(analysis.orientationDistribution)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
        if (template.preferredOrientation === dominantOrientation || template.preferredOrientation === 'mixed') {
            score += 10;
        }
        if (analysis.averageQuality > 70) {
            score += 5;
        }
        if (options.prioritizeFaces && analysis.hasPortraits) {
            score += 10;
        }
        return Math.min(100, Math.max(0, score));
    }
    generateReasoning(template, analysis, _options) {
        const reasons = [];
        if (template.usageCount > 50) {
            reasons.push('Popular template with proven results');
        }
        if (template.averageRating && template.averageRating > 4) {
            reasons.push('Highly rated by users');
        }
        const dominantOrientation = Object.entries(analysis.orientationDistribution)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
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
};
exports.PageLayoutService = PageLayoutService;
exports.PageLayoutService = PageLayoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [layout_template_service_1.LayoutTemplateService,
        metadata_service_1.MetadataService,
        project_service_1.ProjectService])
], PageLayoutService);
//# sourceMappingURL=page-layout.service.js.map