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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const image_metadata_schema_1 = require("./schemas/image-metadata.schema");
const image_analyzer_service_1 = require("../image-analyzer/image-analyzer.service");
let MetadataService = class MetadataService {
    metadataModel;
    imageAnalyzerService;
    constructor(metadataModel, imageAnalyzerService) {
        this.metadataModel = metadataModel;
        this.imageAnalyzerService = imageAnalyzerService;
    }
    async createFromAnalysis(mediaId, imagePath) {
        const existing = await this.metadataModel.findOne({ mediaId }).exec();
        if (existing) {
            return existing;
        }
        const analysis = await this.imageAnalyzerService.analyzeImage(imagePath);
        const layoutSuitability = this.calculateLayoutSuitability(analysis);
        const metadata = new this.metadataModel({
            mediaId: new mongoose_2.Types.ObjectId(mediaId),
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
    async findByMediaId(mediaId) {
        return this.metadataModel.findOne({ mediaId }).exec();
    }
    async findByMediaIds(mediaIds) {
        const objectIds = mediaIds.map(id => new mongoose_2.Types.ObjectId(id));
        return this.metadataModel.find({ mediaId: { $in: objectIds } }).exec();
    }
    async updateAiTags(mediaId, aiTags) {
        const metadata = await this.metadataModel.findOne({ mediaId }).exec();
        if (!metadata) {
            throw new common_1.NotFoundException('Metadata not found');
        }
        metadata.aiTags = aiTags;
        return metadata.save();
    }
    async findByOrientation(orientation) {
        return this.metadataModel.find({ orientation }).exec();
    }
    async findByAspectRatioRange(minRatio, maxRatio) {
        return this.metadataModel.find({
            aspectRatio: { $gte: minRatio, $lte: maxRatio }
        }).exec();
    }
    async findByDominantColor(colorHex, tolerance = 30) {
        const targetRgb = this.hexToRgb(colorHex);
        if (!targetRgb)
            return [];
        const allMetadata = await this.metadataModel.find().exec();
        return allMetadata.filter(metadata => {
            const { r, g, b } = metadata.dominantColor.rgb;
            const distance = Math.sqrt(Math.pow(r - targetRgb.r, 2) +
                Math.pow(g - targetRgb.g, 2) +
                Math.pow(b - targetRgb.b, 2));
            return distance <= tolerance;
        });
    }
    async findByQualityThreshold(minSharpness = 0, minBrightness = 0, minContrast = 0) {
        return this.metadataModel.find({
            'quality.sharpness': { $gte: minSharpness },
            'quality.brightness': { $gte: minBrightness },
            'quality.contrast': { $gte: minContrast },
        }).exec();
    }
    async findWithFaces() {
        return this.metadataModel.find({
            faces: { $exists: true, $not: { $size: 0 } }
        }).exec();
    }
    async findBestForLayout(layoutType, limit = 10) {
        const sortField = `layoutSuitability.${layoutType}`;
        return this.metadataModel
            .find({ [sortField]: { $exists: true } })
            .sort({ [sortField]: -1 })
            .limit(limit)
            .exec();
    }
    async getStatistics() {
        const totalImages = await this.metadataModel.countDocuments().exec();
        const orientationBreakdown = {
            portrait: await this.metadataModel.countDocuments({ orientation: 'portrait' }).exec(),
            landscape: await this.metadataModel.countDocuments({ orientation: 'landscape' }).exec(),
            square: await this.metadataModel.countDocuments({ orientation: 'square' }).exec(),
        };
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
        const imagesWithFaces = await this.metadataModel.countDocuments({
            faces: { $exists: true, $not: { $size: 0 } }
        }).exec();
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
    calculateLayoutSuitability(analysis) {
        const { orientation, quality, aspectRatio, faces } = analysis;
        let fullPage = 50;
        let halfPage = 50;
        let quarter = 50;
        let collage = 50;
        if (orientation === 'landscape') {
            fullPage += 20;
            halfPage += 10;
        }
        else if (orientation === 'portrait') {
            halfPage += 15;
            quarter += 10;
        }
        else {
            collage += 20;
            quarter += 15;
        }
        const avgQuality = (quality.sharpness + quality.brightness + quality.contrast) / 3;
        const qualityBonus = Math.round(avgQuality * 0.3);
        fullPage += qualityBonus;
        halfPage += qualityBonus * 0.8;
        quarter += qualityBonus * 0.6;
        collage += qualityBonus * 0.4;
        if (aspectRatio >= 1.3 && aspectRatio <= 1.8) {
            fullPage += 15;
        }
        if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
            quarter += 10;
            collage += 15;
        }
        if (faces && faces.length > 0) {
            fullPage += 10;
            halfPage += 15;
            if (faces.length > 1) {
                collage += 20;
            }
        }
        return {
            fullPage: Math.min(100, Math.max(0, fullPage)),
            halfPage: Math.min(100, Math.max(0, halfPage)),
            quarter: Math.min(100, Math.max(0, quarter)),
            collage: Math.min(100, Math.max(0, collage)),
        };
    }
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};
exports.MetadataService = MetadataService;
exports.MetadataService = MetadataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(image_metadata_schema_1.ImageMetadata.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        image_analyzer_service_1.ImageAnalyzerService])
], MetadataService);
//# sourceMappingURL=metadata.service.js.map