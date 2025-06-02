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
exports.AIEnhancementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const enhancement_job_schema_1 = require("./schemas/enhancement-job.schema");
const media_service_1 = require("../media/media.service");
let AIEnhancementService = class AIEnhancementService {
    jobModel;
    mediaService;
    configService;
    constructor(jobModel, mediaService, configService) {
        this.jobModel = jobModel;
        this.mediaService = mediaService;
        this.configService = configService;
    }
    async createEnhancementJob(request, user) {
        const media = await this.mediaService.findById(request.mediaId, user);
        const job = new this.jobModel({
            originalMediaId: request.mediaId,
            userId: user._id,
            enhancementType: request.enhancementType,
            parameters: request.parameters || {},
            estimatedDuration: this.estimateProcessingTime(request.enhancementType),
        });
        const savedJob = await job.save();
        this.processEnhancement(savedJob).catch(console.error);
        return savedJob;
    }
    async getJobStatus(jobId, user) {
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException('Enhancement job not found');
        }
        if (job.userId.toString() !== user._id.toString()) {
            throw new common_1.NotFoundException('Enhancement job not found');
        }
        return job;
    }
    async getUserJobs(user) {
        return this.jobModel
            .find({ userId: user._id })
            .sort({ createdAt: -1 })
            .exec();
    }
    async cancelJob(jobId, user) {
        const job = await this.getJobStatus(jobId, user);
        if (job.status === enhancement_job_schema_1.JobStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel completed job');
        }
        if (job.status === enhancement_job_schema_1.JobStatus.PROCESSING) {
            if (job.externalJobId) {
                await this.cancelExternalJob(job.externalJobId, job.enhancementType);
            }
        }
        job.status = enhancement_job_schema_1.JobStatus.CANCELLED;
        await job.save();
    }
    async processEnhancement(job) {
        try {
            job.status = enhancement_job_schema_1.JobStatus.PROCESSING;
            job.startedAt = new Date();
            await job.save();
            let enhancedImagePath;
            switch (job.enhancementType) {
                case enhancement_job_schema_1.EnhancementType.UPSCALE:
                    enhancedImagePath = await this.upscaleImage(job);
                    break;
                case enhancement_job_schema_1.EnhancementType.BACKGROUND_REMOVAL:
                    enhancedImagePath = await this.removeBackground(job);
                    break;
                case enhancement_job_schema_1.EnhancementType.NOISE_REDUCTION:
                    enhancedImagePath = await this.reduceNoise(job);
                    break;
                case enhancement_job_schema_1.EnhancementType.COLOR_CORRECTION:
                    enhancedImagePath = await this.correctColors(job);
                    break;
                case enhancement_job_schema_1.EnhancementType.SHARPENING:
                    enhancedImagePath = await this.sharpenImage(job);
                    break;
                case enhancement_job_schema_1.EnhancementType.STYLE_TRANSFER:
                    enhancedImagePath = await this.transferStyle(job);
                    break;
                default:
                    throw new Error(`Unsupported enhancement type: ${job.enhancementType}`);
            }
            const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId });
            const enhancedStats = await fs.stat(enhancedImagePath);
            const enhancedMedia = await this.mediaService.uploadFile({
                originalname: `enhanced_${originalMedia.originalName}`,
                buffer: await fs.readFile(enhancedImagePath),
                size: enhancedStats.size,
                mimetype: originalMedia.mimeType,
            }, {
                altText: `Enhanced ${originalMedia.altText || originalMedia.originalName}`,
                tags: [...(originalMedia.tags || []), 'ai-enhanced', job.enhancementType.toLowerCase()],
            }, { _id: job.userId });
            job.enhancedMediaId = enhancedMedia._id;
            job.status = enhancement_job_schema_1.JobStatus.COMPLETED;
            job.completedAt = new Date();
            job.progress = 100;
            job.metadata = {
                originalSize: originalMedia.size,
                enhancedSize: enhancedStats.size,
                processingTime: (job.completedAt.getTime() - job.startedAt.getTime()) / 1000,
                serviceUsed: 'internal',
                qualityScore: await this.calculateQualityScore(enhancedImagePath),
            };
            await job.save();
            await fs.unlink(enhancedImagePath);
        }
        catch (error) {
            console.error('Enhancement processing failed:', error);
            job.status = enhancement_job_schema_1.JobStatus.FAILED;
            job.errorMessage = error.message;
            job.completedAt = new Date();
            await job.save();
        }
    }
    async upscaleImage(job) {
        const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId });
        const scale = job.parameters?.scale || 2;
        const outputPath = path.join(process.cwd(), 'temp', `upscaled_${Date.now()}.png`);
        await sharp(originalMedia.path)
            .resize({
            width: Math.round((originalMedia.dimensions?.width || 1000) * scale),
            height: Math.round((originalMedia.dimensions?.height || 1000) * scale),
            kernel: sharp.kernel.lanczos3,
        })
            .png({ quality: 90 })
            .toFile(outputPath);
        return outputPath;
    }
    async removeBackground(job) {
        const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId });
        const outputPath = path.join(process.cwd(), 'temp', `no_bg_${Date.now()}.png`);
        await sharp(originalMedia.path)
            .png()
            .toFile(outputPath);
        return outputPath;
    }
    async reduceNoise(job) {
        const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId });
        const outputPath = path.join(process.cwd(), 'temp', `denoised_${Date.now()}.jpg`);
        await sharp(originalMedia.path)
            .median(3)
            .jpeg({ quality: 95 })
            .toFile(outputPath);
        return outputPath;
    }
    async correctColors(job) {
        const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId });
        const outputPath = path.join(process.cwd(), 'temp', `color_corrected_${Date.now()}.jpg`);
        await sharp(originalMedia.path)
            .modulate({
            brightness: 1.1,
            saturation: 1.2,
        })
            .jpeg({ quality: 95 })
            .toFile(outputPath);
        return outputPath;
    }
    async sharpenImage(job) {
        const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId });
        const outputPath = path.join(process.cwd(), 'temp', `sharpened_${Date.now()}.jpg`);
        await sharp(originalMedia.path)
            .sharpen(1, 1, 2)
            .jpeg({ quality: 95 })
            .toFile(outputPath);
        return outputPath;
    }
    async transferStyle(job) {
        const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId });
        const outputPath = path.join(process.cwd(), 'temp', `styled_${Date.now()}.jpg`);
        await sharp(originalMedia.path)
            .tint({ r: 255, g: 240, b: 220 })
            .jpeg({ quality: 95 })
            .toFile(outputPath);
        return outputPath;
    }
    async calculateQualityScore(imagePath) {
        const stats = await sharp(imagePath).stats();
        const channels = stats.channels;
        let score = 50;
        channels.forEach(channel => {
            if (channel.mean > 50 && channel.mean < 200)
                score += 5;
        });
        return Math.min(100, Math.max(0, score));
    }
    estimateProcessingTime(enhancementType) {
        const estimates = {
            [enhancement_job_schema_1.EnhancementType.UPSCALE]: 120,
            [enhancement_job_schema_1.EnhancementType.BACKGROUND_REMOVAL]: 60,
            [enhancement_job_schema_1.EnhancementType.NOISE_REDUCTION]: 30,
            [enhancement_job_schema_1.EnhancementType.COLOR_CORRECTION]: 15,
            [enhancement_job_schema_1.EnhancementType.SHARPENING]: 10,
            [enhancement_job_schema_1.EnhancementType.STYLE_TRANSFER]: 180,
        };
        return estimates[enhancementType] || 60;
    }
    async cancelExternalJob(externalJobId, enhancementType) {
        console.log(`Cancelling external job ${externalJobId} for ${enhancementType}`);
    }
};
exports.AIEnhancementService = AIEnhancementService;
exports.AIEnhancementService = AIEnhancementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enhancement_job_schema_1.EnhancementJob.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        media_service_1.MediaService,
        config_1.ConfigService])
], AIEnhancementService);
//# sourceMappingURL=ai-enhancement.service.js.map