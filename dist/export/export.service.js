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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const PDFDocument = require("pdfkit");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");
const export_job_schema_1 = require("./schemas/export-job.schema");
const project_service_1 = require("../project/project.service");
const media_service_1 = require("../media/media.service");
let ExportService = class ExportService {
    jobModel;
    projectService;
    mediaService;
    configService;
    exportPath;
    constructor(jobModel, projectService, mediaService, configService) {
        this.jobModel = jobModel;
        this.projectService = projectService;
        this.mediaService = mediaService;
        this.configService = configService;
        this.exportPath = path.join(process.cwd(), 'exports');
        this.ensureExportDirectory();
    }
    async ensureExportDirectory() {
        try {
            await fs.access(this.exportPath);
        }
        catch {
            await fs.mkdir(this.exportPath, { recursive: true });
        }
    }
    async createExportJob(request, user) {
        const project = await this.projectService.findById(request.projectId, user);
        if (project.pages.length === 0) {
            throw new common_1.BadRequestException('Project has no pages to export');
        }
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
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        const savedJob = await job.save();
        this.processExport(savedJob).catch(console.error);
        return savedJob;
    }
    async getJobStatus(jobId, user) {
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException('Export job not found');
        }
        if (job.userId.toString() !== user._id.toString()) {
            throw new common_1.NotFoundException('Export job not found');
        }
        return job;
    }
    async getUserJobs(user) {
        return this.jobModel
            .find({ userId: user._id })
            .sort({ createdAt: -1 })
            .exec();
    }
    async downloadExport(jobId, user) {
        const job = await this.getJobStatus(jobId, user);
        if (job.status !== export_job_schema_1.ExportStatus.COMPLETED || !job.filePath) {
            throw new common_1.BadRequestException('Export not ready for download');
        }
        if (job.expiresAt && job.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Export has expired');
        }
        try {
            const fileBuffer = await fs.readFile(job.filePath);
            const filename = path.basename(job.filePath);
            const mimeType = this.getMimeType(job.format);
            return { stream: fileBuffer, filename, mimeType };
        }
        catch (error) {
            throw new common_1.NotFoundException('Export file not found');
        }
    }
    async processExport(job) {
        try {
            job.status = export_job_schema_1.ExportStatus.PROCESSING;
            job.startedAt = new Date();
            await job.save();
            const project = await this.projectService.findById(job.projectId.toString(), { _id: job.userId });
            let exportPath;
            switch (job.format) {
                case export_job_schema_1.ExportFormat.PDF_PRINT:
                case export_job_schema_1.ExportFormat.PDF_WEB:
                    exportPath = await this.exportToPDF(job, project);
                    break;
                case export_job_schema_1.ExportFormat.JPEG_HIGH:
                case export_job_schema_1.ExportFormat.JPEG_WEB:
                    exportPath = await this.exportToJPEG(job, project);
                    break;
                case export_job_schema_1.ExportFormat.PNG:
                    exportPath = await this.exportToPNG(job, project);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${job.format}`);
            }
            const stats = await fs.stat(exportPath);
            job.status = export_job_schema_1.ExportStatus.COMPLETED;
            job.completedAt = new Date();
            job.progress = 100;
            job.filePath = exportPath;
            job.fileSize = stats.size;
            job.pageCount = project.pages.length;
            job.metadata = {
                processingTime: (job.completedAt.getTime() - job.startedAt.getTime()) / 1000,
                totalImages: project.images.length,
                resolution: `${job.settings?.dpi || 300} DPI`,
                colorSpace: job.settings?.colorProfile || 'sRGB',
                compression: job.format.includes('JPEG') ? 'JPEG' : 'None',
            };
            await job.save();
        }
        catch (error) {
            console.error('Export processing failed:', error);
            job.status = export_job_schema_1.ExportStatus.FAILED;
            job.errorMessage = error.message;
            job.completedAt = new Date();
            await job.save();
        }
    }
    async exportToPDF(job, project) {
        const filename = `export_${job._id}_${Date.now()}.pdf`;
        const outputPath = path.join(this.exportPath, filename);
        const doc = new PDFDocument({
            size: 'A4',
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
        for (let i = 0; i < project.pages.length; i++) {
            const page = project.pages[i];
            if (i > 0) {
                doc.addPage();
            }
            job.progress = Math.round(((i + 1) / project.pages.length) * 90);
            await job.save();
            if (page.background) {
                doc.rect(0, 0, doc.page.width, doc.page.height).fill(page.background.color || '#ffffff');
            }
            for (const imageElement of page.images) {
                try {
                    const media = await this.mediaService.findById(imageElement.imageId, { _id: job.userId });
                    const x = (imageElement.position.x / 100) * doc.page.width;
                    const y = (imageElement.position.y / 100) * doc.page.height;
                    const width = (imageElement.position.width / 100) * doc.page.width;
                    const height = (imageElement.position.height / 100) * doc.page.height;
                    let imagePath = media.path;
                    if (imageElement.effects || imageElement.position.rotation) {
                        imagePath = await this.processImageForExport(media.path, imageElement, job.settings);
                    }
                    doc.image(imagePath, x, y, { width, height });
                    if (imagePath !== media.path) {
                        await fs.unlink(imagePath).catch(() => { });
                    }
                }
                catch (error) {
                    console.error(`Error adding image ${imageElement.imageId}:`, error);
                }
            }
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
    async exportToJPEG(job, project) {
        const filename = `export_${job._id}_${Date.now()}.zip`;
        const outputPath = path.join(this.exportPath, filename);
        const firstPagePath = await this.renderPageAsImage(project.pages[0], job, 'jpeg');
        return firstPagePath;
    }
    async exportToPNG(job, project) {
        const firstPagePath = await this.renderPageAsImage(project.pages[0], job, 'png');
        return firstPagePath;
    }
    async renderPageAsImage(page, job, format) {
        const filename = `page_${Date.now()}.${format}`;
        const outputPath = path.join(this.exportPath, filename);
        const dpi = job.settings?.dpi || 300;
        const width = Math.round((8.5 * dpi));
        const height = Math.round((11 * dpi));
        const canvas = sharp({
            create: {
                width,
                height,
                channels: 3,
                background: { r: 255, g: 255, b: 255 },
            },
        });
        if (format === 'jpeg') {
            await canvas.jpeg({ quality: job.settings?.quality || 95 }).toFile(outputPath);
        }
        else {
            await canvas.png().toFile(outputPath);
        }
        return outputPath;
    }
    async processImageForExport(imagePath, imageElement, settings) {
        const tempPath = path.join(this.exportPath, `temp_${Date.now()}.jpg`);
        let processor = sharp(imagePath);
        if (imageElement.position.rotation) {
            processor = processor.rotate(imageElement.position.rotation);
        }
        if (imageElement.effects) {
            if (imageElement.effects.brightness) {
                processor = processor.modulate({ brightness: imageElement.effects.brightness });
            }
            if (imageElement.effects.contrast) {
                processor = processor.modulate({ brightness: 1, saturation: 1 });
            }
            if (imageElement.effects.saturation) {
                processor = processor.modulate({ saturation: imageElement.effects.saturation });
            }
        }
        await processor.jpeg({ quality: settings.quality || 95 }).toFile(tempPath);
        return tempPath;
    }
    getMimeType(format) {
        switch (format) {
            case export_job_schema_1.ExportFormat.PDF_PRINT:
            case export_job_schema_1.ExportFormat.PDF_WEB:
                return 'application/pdf';
            case export_job_schema_1.ExportFormat.JPEG_HIGH:
            case export_job_schema_1.ExportFormat.JPEG_WEB:
                return 'image/jpeg';
            case export_job_schema_1.ExportFormat.PNG:
                return 'image/png';
            default:
                return 'application/octet-stream';
        }
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(export_job_schema_1.ExportJob.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        project_service_1.ProjectService,
        media_service_1.MediaService,
        config_1.ConfigService])
], ExportService);
//# sourceMappingURL=export.service.js.map