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
exports.MetadataController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const metadata_service_1 = require("./metadata.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let MetadataController = class MetadataController {
    metadataService;
    constructor(metadataService) {
        this.metadataService = metadataService;
    }
    async getByMediaId(mediaId) {
        return this.metadataService.findByMediaId(mediaId);
    }
    async analyzeMedia(mediaId, imagePath) {
        return this.metadataService.createFromAnalysis(mediaId, imagePath);
    }
    async findByOrientation(orientation) {
        return this.metadataService.findByOrientation(orientation);
    }
    async findByAspectRatio(min, max) {
        return this.metadataService.findByAspectRatioRange(min, max);
    }
    async findByColor(hex, tolerance) {
        return this.metadataService.findByDominantColor(hex, tolerance);
    }
    async findByQuality(sharpness, brightness, contrast) {
        return this.metadataService.findByQualityThreshold(sharpness || 0, brightness || 0, contrast || 0);
    }
    async findWithFaces() {
        return this.metadataService.findWithFaces();
    }
    async findBestForLayout(layoutType, limit) {
        return this.metadataService.findBestForLayout(layoutType, limit || 10);
    }
    async updateAiTags(mediaId, tags) {
        return this.metadataService.updateAiTags(mediaId, tags);
    }
    async getStatistics() {
        return this.metadataService.getStatistics();
    }
};
exports.MetadataController = MetadataController;
__decorate([
    (0, common_1.Get)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get metadata for a media file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metadata retrieved successfully' }),
    __param(0, (0, common_1.Param)('mediaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getByMediaId", null);
__decorate([
    (0, common_1.Post)('analyze/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze and create metadata for a media file' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Metadata created successfully' }),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Body)('imagePath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "analyzeMedia", null);
__decorate([
    (0, common_1.Get)('orientation/:orientation'),
    (0, swagger_1.ApiOperation)({ summary: 'Find images by orientation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images retrieved successfully' }),
    __param(0, (0, common_1.Param)('orientation')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "findByOrientation", null);
__decorate([
    (0, common_1.Get)('aspect-ratio'),
    (0, swagger_1.ApiOperation)({ summary: 'Find images by aspect ratio range' }),
    (0, swagger_1.ApiQuery)({ name: 'min', type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'max', type: 'number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images retrieved successfully' }),
    __param(0, (0, common_1.Query)('min')),
    __param(1, (0, common_1.Query)('max')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "findByAspectRatio", null);
__decorate([
    (0, common_1.Get)('color/:hex'),
    (0, swagger_1.ApiOperation)({ summary: 'Find images by dominant color' }),
    (0, swagger_1.ApiQuery)({ name: 'tolerance', type: 'number', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images retrieved successfully' }),
    __param(0, (0, common_1.Param)('hex')),
    __param(1, (0, common_1.Query)('tolerance')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "findByColor", null);
__decorate([
    (0, common_1.Get)('quality'),
    (0, swagger_1.ApiOperation)({ summary: 'Find images by quality thresholds' }),
    (0, swagger_1.ApiQuery)({ name: 'sharpness', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'brightness', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'contrast', type: 'number', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images retrieved successfully' }),
    __param(0, (0, common_1.Query)('sharpness')),
    __param(1, (0, common_1.Query)('brightness')),
    __param(2, (0, common_1.Query)('contrast')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "findByQuality", null);
__decorate([
    (0, common_1.Get)('faces'),
    (0, swagger_1.ApiOperation)({ summary: 'Find images with detected faces' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images with faces retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "findWithFaces", null);
__decorate([
    (0, common_1.Get)('layout/:layoutType'),
    (0, swagger_1.ApiOperation)({ summary: 'Find best images for a specific layout type' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Best images for layout retrieved successfully' }),
    __param(0, (0, common_1.Param)('layoutType')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "findBestForLayout", null);
__decorate([
    (0, common_1.Put)('ai-tags/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update AI-generated tags for an image' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI tags updated successfully' }),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Body)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "updateAiTags", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get metadata statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getStatistics", null);
exports.MetadataController = MetadataController = __decorate([
    (0, swagger_1.ApiTags)('Image Metadata'),
    (0, common_1.Controller)('metadata'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [metadata_service_1.MetadataService])
], MetadataController);
//# sourceMappingURL=metadata.controller.js.map