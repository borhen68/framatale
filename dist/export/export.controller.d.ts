import { Response } from 'express';
import { ExportService, ExportRequest } from './export.service';
import { ExportJob } from './schemas/export-job.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class ExportController {
    private exportService;
    constructor(exportService: ExportService);
    createExport(request: ExportRequest, user: UserDocument): Promise<ExportJob>;
    getUserJobs(user: UserDocument): Promise<ExportJob[]>;
    getJobStatus(jobId: string, user: UserDocument): Promise<ExportJob>;
    downloadExport(jobId: string, user: UserDocument, res: Response): Promise<void>;
}
