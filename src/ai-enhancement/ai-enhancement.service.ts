import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { EnhancementJob, EnhancementJobDocument, EnhancementType, JobStatus } from './schemas/enhancement-job.schema';
import { MediaService } from '../media/media.service';
import { UserDocument } from '../user/schemas/user.schema';

export interface EnhancementRequest {
  mediaId: string;
  enhancementType: EnhancementType;
  parameters?: {
    scale?: number;
    quality?: number;
    preserveTransparency?: boolean;
    styleReference?: string;
    customSettings?: Record<string, any>;
  };
}

@Injectable()
export class AIEnhancementService {
  constructor(
    @InjectModel(EnhancementJob.name) private jobModel: Model<EnhancementJobDocument>,
    private mediaService: MediaService,
    private configService: ConfigService,
  ) {}

  async createEnhancementJob(
    request: EnhancementRequest,
    user: UserDocument,
  ): Promise<EnhancementJob> {
    // Verify media exists and user has access
    const media = await this.mediaService.findById(request.mediaId, user);

    // Create enhancement job
    const job = new this.jobModel({
      originalMediaId: request.mediaId,
      userId: user._id,
      enhancementType: request.enhancementType,
      parameters: request.parameters || {},
      estimatedDuration: this.estimateProcessingTime(request.enhancementType),
    });

    const savedJob = await job.save();

    // Start processing asynchronously
    this.processEnhancement(savedJob).catch(console.error);

    return savedJob;
  }

  async getJobStatus(jobId: string, user: UserDocument): Promise<EnhancementJob> {
    const job = await this.jobModel.findById(jobId).exec();

    if (!job) {
      throw new NotFoundException('Enhancement job not found');
    }

    // Check if user owns the job
    if (job.userId.toString() !== (user._id as any).toString()) {
      throw new NotFoundException('Enhancement job not found');
    }

    return job;
  }

  async getUserJobs(user: UserDocument): Promise<EnhancementJob[]> {
    return this.jobModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async cancelJob(jobId: string, user: UserDocument): Promise<void> {
    const job = await this.getJobStatus(jobId, user);

    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed job');
    }

    if (job.status === JobStatus.PROCESSING) {
      // TODO: Cancel external service job if applicable
      if (job.externalJobId) {
        await this.cancelExternalJob(job.externalJobId, job.enhancementType);
      }
    }

    job.status = JobStatus.CANCELLED;
    await (job as any).save();
  }

  private async processEnhancement(job: EnhancementJobDocument): Promise<void> {
    try {
      job.status = JobStatus.PROCESSING;
      job.startedAt = new Date();
      await job.save();

      let enhancedImagePath: string;

      switch (job.enhancementType) {
        case EnhancementType.UPSCALE:
          enhancedImagePath = await this.upscaleImage(job);
          break;
        case EnhancementType.BACKGROUND_REMOVAL:
          enhancedImagePath = await this.removeBackground(job);
          break;
        case EnhancementType.NOISE_REDUCTION:
          enhancedImagePath = await this.reduceNoise(job);
          break;
        case EnhancementType.COLOR_CORRECTION:
          enhancedImagePath = await this.correctColors(job);
          break;
        case EnhancementType.SHARPENING:
          enhancedImagePath = await this.sharpenImage(job);
          break;
        case EnhancementType.STYLE_TRANSFER:
          enhancedImagePath = await this.transferStyle(job);
          break;
        default:
          throw new Error(`Unsupported enhancement type: ${job.enhancementType}`);
      }

      // Create new media record for enhanced image
      const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId } as any);
      const enhancedStats = await fs.stat(enhancedImagePath);

      const enhancedMedia = await this.mediaService.uploadFile(
        {
          originalname: `enhanced_${originalMedia.originalName}`,
          buffer: await fs.readFile(enhancedImagePath),
          size: enhancedStats.size,
          mimetype: originalMedia.mimeType,
        } as any,
        {
          altText: `Enhanced ${originalMedia.altText || originalMedia.originalName}`,
          tags: [...(originalMedia.tags || []), 'ai-enhanced', job.enhancementType.toLowerCase()],
        },
        { _id: job.userId } as any,
      );

      // Update job with results
      job.enhancedMediaId = (enhancedMedia as any)._id;
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
      job.progress = 100;
      job.metadata = {
        originalSize: originalMedia.size,
        enhancedSize: enhancedStats.size,
        processingTime: (job.completedAt.getTime() - job.startedAt!.getTime()) / 1000,
        serviceUsed: 'internal',
        qualityScore: await this.calculateQualityScore(enhancedImagePath),
      };

      await job.save();

      // Clean up temporary file
      await fs.unlink(enhancedImagePath);

    } catch (error) {
      console.error('Enhancement processing failed:', error);
      job.status = JobStatus.FAILED;
      job.errorMessage = error.message;
      job.completedAt = new Date();
      await job.save();
    }
  }

  private async upscaleImage(job: EnhancementJobDocument): Promise<string> {
    const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId } as any);
    const scale = job.parameters?.scale || 2;

    // For now, use Sharp for basic upscaling
    // In production, you'd integrate with Real-ESRGAN or similar service
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

  private async removeBackground(job: EnhancementJobDocument): Promise<string> {
    const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId } as any);

    // Placeholder implementation - integrate with rembg or similar service
    const outputPath = path.join(process.cwd(), 'temp', `no_bg_${Date.now()}.png`);

    // For now, just copy the original (in production, use actual background removal)
    await sharp(originalMedia.path)
      .png()
      .toFile(outputPath);

    return outputPath;
  }

  private async reduceNoise(job: EnhancementJobDocument): Promise<string> {
    const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId } as any);
    const outputPath = path.join(process.cwd(), 'temp', `denoised_${Date.now()}.jpg`);

    await sharp(originalMedia.path)
      .median(3) // Simple noise reduction
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    return outputPath;
  }

  private async correctColors(job: EnhancementJobDocument): Promise<string> {
    const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId } as any);
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

  private async sharpenImage(job: EnhancementJobDocument): Promise<string> {
    const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId } as any);
    const outputPath = path.join(process.cwd(), 'temp', `sharpened_${Date.now()}.jpg`);

    await sharp(originalMedia.path)
      .sharpen(1, 1, 2)
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    return outputPath;
  }

  private async transferStyle(job: EnhancementJobDocument): Promise<string> {
    const originalMedia = await this.mediaService.findById(job.originalMediaId.toString(), { _id: job.userId } as any);
    const outputPath = path.join(process.cwd(), 'temp', `styled_${Date.now()}.jpg`);

    // Placeholder - in production, integrate with style transfer AI service
    await sharp(originalMedia.path)
      .tint({ r: 255, g: 240, b: 220 }) // Warm tone as example
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    return outputPath;
  }

  private async calculateQualityScore(imagePath: string): Promise<number> {
    // Simple quality assessment - in production, use more sophisticated metrics
    const stats = await sharp(imagePath).stats();
    const channels = stats.channels;

    // Calculate based on entropy and other factors
    let score = 50;

    channels.forEach(channel => {
      // Simple quality assessment based on mean values
      if (channel.mean > 50 && channel.mean < 200) score += 5;
    });

    return Math.min(100, Math.max(0, score));
  }

  private estimateProcessingTime(enhancementType: EnhancementType): number {
    const estimates = {
      [EnhancementType.UPSCALE]: 120, // 2 minutes
      [EnhancementType.BACKGROUND_REMOVAL]: 60, // 1 minute
      [EnhancementType.NOISE_REDUCTION]: 30, // 30 seconds
      [EnhancementType.COLOR_CORRECTION]: 15, // 15 seconds
      [EnhancementType.SHARPENING]: 10, // 10 seconds
      [EnhancementType.STYLE_TRANSFER]: 180, // 3 minutes
    };

    return estimates[enhancementType] || 60;
  }

  private async cancelExternalJob(externalJobId: string, enhancementType: EnhancementType): Promise<void> {
    // Implement cancellation logic for external services
    console.log(`Cancelling external job ${externalJobId} for ${enhancementType}`);
  }
}
