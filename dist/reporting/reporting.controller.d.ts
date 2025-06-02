import { Response } from 'express';
import { ReportingService, CreateReportRequest } from './reporting.service';
import { Report } from './schemas/report.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class ReportingController {
    private reportingService;
    constructor(reportingService: ReportingService);
    createReport(request: CreateReportRequest, user: UserDocument): Promise<Report>;
    getReports(user: UserDocument): Promise<Report[]>;
    getReport(reportId: string, user: UserDocument): Promise<Report>;
    downloadReport(reportId: string, user: UserDocument, res: Response): Promise<void>;
}
