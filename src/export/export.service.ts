import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { ExportJob, ExportJobDocument, ExportFormat, ExportStatus } from './schemas/export-job.schema';
import { ProjectService } from '../project/project.service';
import { MediaService } from '../media/media.service';
import { UserDocument } from '../user/schemas/user.schema';

export interface ExportRequest {
  projectId: string;
  format: ExportFormat;
  settings?: {
    dpi?: number;
    quality?: number;
    colorProfile?: string;
    bleed?: boolean;
    cropMarks?: boolean;
    includeMetadata?: boolean;
    pageRange?: string;
  };
}

@Injectable()
export class ExportService {
  private readonly exportPath: string;

  constructor(
    @InjectModel(ExportJob.name) private jobModel: Model<ExportJobDocument>,
    private projectService: ProjectService,
    private mediaService: MediaService,
    private configService: ConfigService,
  ) {
    this.exportPath = path.join(process.cwd(), 'exports');
    this.ensureExportDirectory();
  }

  private async ensureExportDirectory(): Promise<void> {
    try {
      await fs.access(this.exportPath);
    } catch {
      await fs.mkdir(this.exportPath, { recursive: true });
    }
  }

  async createExportJob(request: ExportRequest, user: UserDocument): Promise<ExportJob> {
    // Verify project exists and user has access
    const project = await this.projectService.findById(request.projectId, user);

    if (project.pages.length === 0) {
      throw new BadRequestException('Project has no pages to export');
    }

    // Create export job
    const job = new this.jobModel({
      projectId: request.projectId,
      userId: user._id,
      format: request.format,
      settings: {
        dpi: request.settings?.dpi || 300,
        quality: request.settings?.quality || 95,
        colorProfile: request.settings?.colorProfile || 'sRGB',
        bleed: request.settings?.bleed || false,
        cropMarks: request.settings?.cropMarks || false,
        includeMetadata: request.settings?.includeMetadata || true,
        pageRange: request.settings?.pageRange || 'all',
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const savedJob = await job.save();

    // Start processing asynchronously
    this.processExport(savedJob).catch(console.error);

    return savedJob;
  }

  async getJobStatus(jobId: string, user: UserDocument): Promise<ExportJob> {
    const job = await this.jobModel.findById(jobId).exec();

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    // Check if user owns the job
    if (job.userId.toString() !== (user._id as any).toString()) {
      throw new NotFoundException('Export job not found');
    }

    return job;
  }

  async getUserJobs(user: UserDocument): Promise<ExportJob[]> {
    return this.jobModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async downloadExport(jobId: string, user: UserDocument): Promise<{ stream: Buffer; filename: string; mimeType: string }> {
    const job = await this.getJobStatus(jobId, user);

    if (job.status !== ExportStatus.COMPLETED || !job.filePath) {
      throw new BadRequestException('Export not ready for download');
    }

    if (job.expiresAt && job.expiresAt < new Date()) {
      throw new BadRequestException('Export has expired');
    }

    try {
      const fileBuffer = await fs.readFile(job.filePath);
      const filename = path.basename(job.filePath);
      const mimeType = this.getMimeType(job.format);

      return { stream: fileBuffer, filename, mimeType };
    } catch (error) {
      throw new NotFoundException('Export file not found');
    }
  }

  private async processExport(job: ExportJobDocument): Promise<void> {
    try {
      job.status = ExportStatus.PROCESSING;
      job.startedAt = new Date();
      await job.save();

      const project = await this.projectService.findById(job.projectId.toString(), { _id: job.userId } as any);

      let exportPath: string;

      switch (job.format) {
        case ExportFormat.PDF_PRINT:
        case ExportFormat.PDF_WEB:
          exportPath = await this.exportToPDF(job, project);
          break;
        case ExportFormat.JPEG_HIGH:
        case ExportFormat.JPEG_WEB:
          exportPath = await this.exportToJPEG(job, project);
          break;
        case ExportFormat.PNG:
          exportPath = await this.exportToPNG(job, project);
          break;
        default:
          throw new Error(`Unsupported export format: ${job.format}`);
      }

      const stats = await fs.stat(exportPath);

      job.status = ExportStatus.COMPLETED;
      job.completedAt = new Date();
      job.progress = 100;
      job.filePath = exportPath;
      job.fileSize = stats.size;
      job.pageCount = project.pages.length;
      job.metadata = {
        processingTime: (job.completedAt.getTime() - job.startedAt!.getTime()) / 1000,
        totalImages: project.images.length,
        resolution: `${job.settings?.dpi || 300} DPI`,
        colorSpace: job.settings?.colorProfile || 'sRGB',
        compression: job.format.includes('JPEG') ? 'JPEG' : 'None',
      };

      await job.save();

    } catch (error) {
      console.error('Export processing failed:', error);
      job.status = ExportStatus.FAILED;
      job.errorMessage = error.message;
      job.completedAt = new Date();
      await job.save();
    }
  }

  private async exportToPDF(job: ExportJobDocument, project: any): Promise<string> {
    const filename = `export_${job._id}_${Date.now()}.pdf`;
    const outputPath = path.join(this.exportPath, filename);

    const doc = new PDFDocument({
      size: 'A4', // This should be dynamic based on project size
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      info: {
        Title: project.title,
        Author: 'Frametale',
        Subject: `${project.type} Export`,
        Creator: 'Frametale Backend',
        Producer: 'Frametale PDF Engine',
      },
    });

    const stream = fsSync.createWriteStream(outputPath);
    doc.pipe(stream);

    // Process each page
    for (let i = 0; i < project.pages.length; i++) {
      const page = project.pages[i];

      if (i > 0) {
        doc.addPage();
      }

      // Update progress
      job.progress = Math.round(((i + 1) / project.pages.length) * 90);
      await job.save();

      // Add background if specified
      if (page.background) {
        // Add background color/image
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(page.background.color || '#ffffff');
      }

      // Add images
      for (const imageElement of page.images) {
        try {
          const media = await this.mediaService.findById(imageElement.imageId, { _id: job.userId } as any);

          // Calculate position and size
          const x = (imageElement.position.x / 100) * doc.page.width;
          const y = (imageElement.position.y / 100) * doc.page.height;
          const width = (imageElement.position.width / 100) * doc.page.width;
          const height = (imageElement.position.height / 100) * doc.page.height;

          // Process image if needed
          let imagePath = media.path;
          if (imageElement.effects || imageElement.position.rotation) {
            imagePath = await this.processImageForExport(media.path, imageElement, job.settings!);
          }

          doc.image(imagePath, x, y, { width, height });

          // Clean up processed image if it was temporary
          if (imagePath !== media.path) {
            await fs.unlink(imagePath).catch(() => {}); // Ignore errors
          }
        } catch (error) {
          console.error(`Error adding image ${imageElement.imageId}:`, error);
        }
      }

      // Add text elements
      for (const textElement of page.text || []) {
        const x = (textElement.position.x / 100) * doc.page.width;
        const y = (textElement.position.y / 100) * doc.page.height;
        const width = (textElement.position.width / 100) * doc.page.width;

        doc.font(textElement.style.fontFamily || 'Helvetica')
           .fontSize(textElement.style.fontSize || 12)
           .fillColor(textElement.style.color || '#000000')
           .text(textElement.content, x, y, {
             width,
             align: textElement.style.textAlign || 'left',
           });
      }
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  private async exportToJPEG(job: ExportJobDocument, project: any): Promise<string> {
    // For JPEG export, we'll create individual page images
    const filename = `export_${job._id}_${Date.now()}.zip`;
    const outputPath = path.join(this.exportPath, filename);

    // This is a simplified implementation
    // In production, you'd create a ZIP file with all page images
    const firstPagePath = await this.renderPageAsImage(project.pages[0], job, 'jpeg');

    // For now, just return the first page
    // TODO: Implement ZIP creation for multiple pages
    return firstPagePath;
  }

  private async exportToPNG(job: ExportJobDocument, project: any): Promise<string> {
    const firstPagePath = await this.renderPageAsImage(project.pages[0], job, 'png');
    return firstPagePath;
  }

  private async renderPageAsImage(page: any, job: ExportJobDocument, format: 'jpeg' | 'png'): Promise<string> {
    const filename = `page_${Date.now()}.${format}`;
    const outputPath = path.join(this.exportPath, filename);

    const dpi = job.settings?.dpi || 300;
    const width = Math.round((8.5 * dpi)); // 8.5 inches width
    const height = Math.round((11 * dpi)); // 11 inches height

    // Create a blank canvas
    const canvas = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    });

    // This is a simplified implementation
    // In production, you'd composite all images and text onto the canvas

    if (format === 'jpeg') {
      await canvas.jpeg({ quality: job.settings?.quality || 95 }).toFile(outputPath);
    } else {
      await canvas.png().toFile(outputPath);
    }

    return outputPath;
  }

  private async processImageForExport(imagePath: string, imageElement: any, settings: any): Promise<string> {
    const tempPath = path.join(this.exportPath, `temp_${Date.now()}.jpg`);

    let processor = sharp(imagePath);

    // Apply rotation
    if (imageElement.position.rotation) {
      processor = processor.rotate(imageElement.position.rotation);
    }

    // Apply effects
    if (imageElement.effects) {
      if (imageElement.effects.brightness) {
        processor = processor.modulate({ brightness: imageElement.effects.brightness });
      }
      if (imageElement.effects.contrast) {
        processor = processor.modulate({ brightness: 1, saturation: 1 }); // Simplified
      }
      if (imageElement.effects.saturation) {
        processor = processor.modulate({ saturation: imageElement.effects.saturation });
      }
    }

    await processor.jpeg({ quality: settings.quality || 95 }).toFile(tempPath);
    return tempPath;
  }

  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.PDF_PRINT:
      case ExportFormat.PDF_WEB:
        return 'application/pdf';
      case ExportFormat.JPEG_HIGH:
      case ExportFormat.JPEG_WEB:
        return 'image/jpeg';
      case ExportFormat.PNG:
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}
