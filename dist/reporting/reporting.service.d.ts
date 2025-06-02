import { Model } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportFormat, ReportFrequency } from './schemas/report.schema';
import { AnalyticsService } from '../analytics/analytics.service';
import { OrderService } from '../order/order.service';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schemas/user.schema';
export interface CreateReportRequest {
    name: string;
    description?: string;
    type: ReportType;
    format: ReportFormat;
    parameters: {
        startDate: Date;
        endDate: Date;
        filters?: Record<string, any>;
        groupBy?: string[];
        metrics?: string[];
        dimensions?: string[];
    };
    schedule?: {
        frequency: ReportFrequency;
        recipients: string[];
    };
}
export declare class ReportingService {
    private reportModel;
    private analyticsService;
    private orderService;
    private userService;
    private readonly reportsPath;
    constructor(reportModel: Model<ReportDocument>, analyticsService: AnalyticsService, orderService: OrderService, userService: UserService);
    private ensureReportsDirectory;
    createReport(request: CreateReportRequest, user: UserDocument): Promise<Report>;
    getReports(user: UserDocument): Promise<Report[]>;
    getReport(reportId: string, user: UserDocument): Promise<ReportDocument>;
    downloadReport(reportId: string, user: UserDocument): Promise<{
        stream: Buffer;
        filename: string;
        mimeType: string;
    }>;
    processScheduledReports(): Promise<void>;
    private generateReport;
    private generateSalesReport;
    private generateUserEngagementReport;
    private generateProductPerformanceReport;
    private generateFinancialReport;
    private generateOperationalReport;
    private saveReportFile;
    private saveAsCSV;
    private saveAsExcel;
    private saveAsPDF;
    private saveAsJSON;
    private calculateNextRun;
    private getMimeType;
}
