import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ExportJob, ExportJobDocument, ExportFormat } from './schemas/export-job.schema';
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
export declare class ExportService {
    private jobModel;
    private projectService;
    private mediaService;
    private configService;
    private readonly exportPath;
    constructor(jobModel: Model<ExportJobDocument>, projectService: ProjectService, mediaService: MediaService, configService: ConfigService);
    private ensureExportDirectory;
    createExportJob(request: ExportRequest, user: UserDocument): Promise<ExportJob>;
    getJobStatus(jobId: string, user: UserDocument): Promise<ExportJob>;
    getUserJobs(user: UserDocument): Promise<ExportJob[]>;
    downloadExport(jobId: string, user: UserDocument): Promise<{
        stream: Buffer;
        filename: string;
        mimeType: string;
    }>;
    private processExport;
    private exportToPDF;
    private exportToJPEG;
    private exportToPNG;
    private renderPageAsImage;
    private processImageForExport;
    private getMimeType;
}
