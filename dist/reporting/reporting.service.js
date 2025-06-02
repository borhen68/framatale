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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");
const fs = require("fs/promises");
const path = require("path");
const report_schema_1 = require("./schemas/report.schema");
const analytics_service_1 = require("../analytics/analytics.service");
const order_service_1 = require("../order/order.service");
const user_service_1 = require("../user/user.service");
let ReportingService = class ReportingService {
    reportModel;
    analyticsService;
    orderService;
    userService;
    reportsPath;
    constructor(reportModel, analyticsService, orderService, userService) {
        this.reportModel = reportModel;
        this.analyticsService = analyticsService;
        this.orderService = orderService;
        this.userService = userService;
        this.reportsPath = path.join(process.cwd(), 'reports');
        this.ensureReportsDirectory();
    }
    async ensureReportsDirectory() {
        try {
            await fs.access(this.reportsPath);
        }
        catch {
            await fs.mkdir(this.reportsPath, { recursive: true });
        }
    }
    async createReport(request, user) {
        const report = new this.reportModel({
            ...request,
            createdBy: user._id,
            status: report_schema_1.ReportStatus.PENDING,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        if (request.schedule) {
            report.schedule = {
                ...request.schedule,
                nextRunAt: this.calculateNextRun(request.schedule.frequency),
                isActive: true,
            };
            report.status = report_schema_1.ReportStatus.SCHEDULED;
        }
        const savedReport = await report.save();
        if (!request.schedule) {
            this.generateReport(savedReport).catch(console.error);
        }
        return savedReport;
    }
    async getReports(user) {
        return this.reportModel
            .find({ createdBy: user._id })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getReport(reportId, user) {
        const report = await this.reportModel.findById(reportId).exec();
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        if (report.createdBy.toString() !== user._id.toString() && !report.isShared) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async downloadReport(reportId, user) {
        const report = await this.getReport(reportId, user);
        if (report.status !== report_schema_1.ReportStatus.COMPLETED || !report.filePath) {
            throw new Error('Report not ready for download');
        }
        try {
            const fileBuffer = await fs.readFile(report.filePath);
            const filename = path.basename(report.filePath);
            const mimeType = this.getMimeType(report.format);
            return { stream: fileBuffer, filename, mimeType };
        }
        catch (error) {
            throw new common_1.NotFoundException('Report file not found');
        }
    }
    async processScheduledReports() {
        const now = new Date();
        const scheduledReports = await this.reportModel
            .find({
            status: report_schema_1.ReportStatus.SCHEDULED,
            'schedule.isActive': true,
            'schedule.nextRunAt': { $lte: now },
        })
            .exec();
        for (const report of scheduledReports) {
            await this.generateReport(report);
            if (report.schedule) {
                report.schedule.nextRunAt = this.calculateNextRun(report.schedule.frequency);
                report.schedule.lastRunAt = now;
                await report.save();
            }
        }
    }
    async generateReport(report) {
        try {
            report.status = report_schema_1.ReportStatus.GENERATING;
            report.startedAt = new Date();
            await report.save();
            let data;
            switch (report.type) {
                case report_schema_1.ReportType.SALES:
                    data = await this.generateSalesReport(report.parameters);
                    break;
                case report_schema_1.ReportType.USER_ENGAGEMENT:
                    data = await this.generateUserEngagementReport(report.parameters);
                    break;
                case report_schema_1.ReportType.PRODUCT_PERFORMANCE:
                    data = await this.generateProductPerformanceReport(report.parameters);
                    break;
                case report_schema_1.ReportType.FINANCIAL:
                    data = await this.generateFinancialReport(report.parameters);
                    break;
                case report_schema_1.ReportType.OPERATIONAL:
                    data = await this.generateOperationalReport(report.parameters);
                    break;
                default:
                    throw new Error(`Unsupported report type: ${report.type}`);
            }
            report.data = data;
            const filePath = await this.saveReportFile(report, data);
            const stats = await fs.stat(filePath);
            report.status = report_schema_1.ReportStatus.COMPLETED;
            report.completedAt = new Date();
            report.filePath = filePath;
            report.fileSize = stats.size;
            report.metadata = {
                rowCount: Array.isArray(data.rows) ? data.rows.length : 0,
                columnCount: Array.isArray(data.columns) ? data.columns.length : 0,
                generationTime: (report.completedAt.getTime() - report.startedAt.getTime()) / 1000,
                dataSource: 'frametale-db',
                version: '1.0',
            };
            await report.save();
        }
        catch (error) {
            console.error('Report generation failed:', error);
            report.status = report_schema_1.ReportStatus.FAILED;
            report.errorMessage = error.message;
            report.completedAt = new Date();
            await report.save();
        }
    }
    async generateSalesReport(parameters) {
        const { startDate, endDate } = parameters;
        const orderStats = await this.orderService.getOrderStatistics();
        const metrics = await this.analyticsService.getMetrics(startDate, endDate);
        return {
            title: 'Sales Report',
            period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
            summary: {
                totalRevenue: metrics.totalRevenue,
                totalOrders: orderStats.totalOrders,
                averageOrderValue: orderStats.averageOrderValue,
                conversionRate: metrics.conversionRate,
            },
            columns: ['Date', 'Revenue', 'Orders', 'AOV'],
            rows: metrics.revenueGrowth.map(day => [
                day.date,
                day.revenue,
                0,
                0,
            ]),
        };
    }
    async generateUserEngagementReport(parameters) {
        const { startDate, endDate } = parameters;
        const metrics = await this.analyticsService.getMetrics(startDate, endDate);
        return {
            title: 'User Engagement Report',
            period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
            summary: {
                totalUsers: metrics.uniqueUsers,
                totalEvents: metrics.totalEvents,
                topEvents: metrics.topEvents,
            },
            columns: ['Event Type', 'Count', 'Percentage'],
            rows: metrics.topEvents.map(event => [
                event.eventType,
                event.count,
                ((event.count / metrics.totalEvents) * 100).toFixed(2) + '%',
            ]),
        };
    }
    async generateProductPerformanceReport(parameters) {
        const orderStats = await this.orderService.getOrderStatistics();
        return {
            title: 'Product Performance Report',
            summary: {
                topProducts: orderStats.topProducts,
            },
            columns: ['Product Type', 'Units Sold', 'Revenue'],
            rows: orderStats.topProducts.map(product => [
                product.productType,
                product.count,
                0,
            ]),
        };
    }
    async generateFinancialReport(parameters) {
        const { startDate, endDate } = parameters;
        const metrics = await this.analyticsService.getMetrics(startDate, endDate);
        return {
            title: 'Financial Report',
            period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
            summary: {
                totalRevenue: metrics.totalRevenue,
            },
            columns: ['Date', 'Revenue'],
            rows: metrics.revenueGrowth.map(day => [day.date, day.revenue]),
        };
    }
    async generateOperationalReport(parameters) {
        const orderStats = await this.orderService.getOrderStatistics();
        return {
            title: 'Operational Report',
            summary: {
                totalOrders: orderStats.totalOrders,
                ordersByStatus: orderStats.ordersByStatus,
            },
            columns: ['Status', 'Count'],
            rows: Object.entries(orderStats.ordersByStatus).map(([status, count]) => [status, count]),
        };
    }
    async saveReportFile(report, data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${report.name.replace(/\s+/g, '_')}_${timestamp}`;
        switch (report.format) {
            case report_schema_1.ReportFormat.CSV:
                return this.saveAsCSV(filename, data);
            case report_schema_1.ReportFormat.EXCEL:
                return this.saveAsExcel(filename, data);
            case report_schema_1.ReportFormat.PDF:
                return this.saveAsPDF(filename, data);
            case report_schema_1.ReportFormat.JSON:
                return this.saveAsJSON(filename, data);
            default:
                throw new Error(`Unsupported format: ${report.format}`);
        }
    }
    async saveAsCSV(filename, data) {
        const filePath = path.join(this.reportsPath, `${filename}.csv`);
        let csvContent = data.columns.join(',') + '\n';
        csvContent += data.rows.map((row) => row.join(',')).join('\n');
        await fs.writeFile(filePath, csvContent);
        return filePath;
    }
    async saveAsExcel(filename, data) {
        const filePath = path.join(this.reportsPath, `${filename}.xlsx`);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([data.columns, ...data.rows]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, filePath);
        return filePath;
    }
    async saveAsPDF(filename, data) {
        const filePath = path.join(this.reportsPath, `${filename}.pdf`);
        const doc = new PDFDocument();
        const stream = require('fs').createWriteStream(filePath);
        doc.pipe(stream);
        doc.fontSize(20).text(data.title, 50, 50);
        if (data.summary) {
            doc.fontSize(14).text('Summary:', 50, 100);
            let yPos = 120;
            Object.entries(data.summary).forEach(([key, value]) => {
                doc.fontSize(12).text(`${key}: ${value}`, 50, yPos);
                yPos += 20;
            });
        }
        doc.end();
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
    async saveAsJSON(filename, data) {
        const filePath = path.join(this.reportsPath, `${filename}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return filePath;
    }
    calculateNextRun(frequency) {
        const now = new Date();
        switch (frequency) {
            case report_schema_1.ReportFrequency.DAILY:
                return new Date(now.getTime() + 24 * 60 * 60 * 1000);
            case report_schema_1.ReportFrequency.WEEKLY:
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            case report_schema_1.ReportFrequency.MONTHLY:
                const nextMonth = new Date(now);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                return nextMonth;
            case report_schema_1.ReportFrequency.QUARTERLY:
                const nextQuarter = new Date(now);
                nextQuarter.setMonth(nextQuarter.getMonth() + 3);
                return nextQuarter;
            case report_schema_1.ReportFrequency.YEARLY:
                const nextYear = new Date(now);
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                return nextYear;
            default:
                return now;
        }
    }
    getMimeType(format) {
        switch (format) {
            case report_schema_1.ReportFormat.PDF:
                return 'application/pdf';
            case report_schema_1.ReportFormat.CSV:
                return 'text/csv';
            case report_schema_1.ReportFormat.EXCEL:
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case report_schema_1.ReportFormat.JSON:
                return 'application/json';
            default:
                return 'application/octet-stream';
        }
    }
};
exports.ReportingService = ReportingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportingService.prototype, "processScheduledReports", null);
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(report_schema_1.Report.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        analytics_service_1.AnalyticsService,
        order_service_1.OrderService,
        user_service_1.UserService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map