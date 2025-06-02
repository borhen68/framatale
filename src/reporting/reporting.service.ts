import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as XLSX from 'xlsx';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Report, ReportDocument, ReportType, ReportStatus, ReportFormat, ReportFrequency } from './schemas/report.schema';
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

@Injectable()
export class ReportingService {
  private readonly reportsPath: string;

  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    private analyticsService: AnalyticsService,
    private orderService: OrderService,
    private userService: UserService,
  ) {
    this.reportsPath = path.join(process.cwd(), 'reports');
    this.ensureReportsDirectory();
  }

  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.access(this.reportsPath);
    } catch {
      await fs.mkdir(this.reportsPath, { recursive: true });
    }
  }

  async createReport(request: CreateReportRequest, user: UserDocument): Promise<Report> {
    const report = new this.reportModel({
      ...request,
      createdBy: user._id,
      status: ReportStatus.PENDING,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    if (request.schedule) {
      report.schedule = {
        ...request.schedule,
        nextRunAt: this.calculateNextRun(request.schedule.frequency),
        isActive: true,
      };
      report.status = ReportStatus.SCHEDULED;
    }

    const savedReport = await report.save();

    // Generate report immediately if not scheduled
    if (!request.schedule) {
      this.generateReport(savedReport).catch(console.error);
    }

    return savedReport;
  }

  async getReports(user: UserDocument): Promise<Report[]> {
    return this.reportModel
      .find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getReport(reportId: string, user: UserDocument): Promise<ReportDocument> {
    const report = await this.reportModel.findById(reportId).exec();
    
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check if user owns the report or if it's shared
    if (report.createdBy.toString() !== (user._id as any).toString() && !report.isShared) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async downloadReport(reportId: string, user: UserDocument): Promise<{ stream: Buffer; filename: string; mimeType: string }> {
    const report = await this.getReport(reportId, user);

    if (report.status !== ReportStatus.COMPLETED || !report.filePath) {
      throw new Error('Report not ready for download');
    }

    try {
      const fileBuffer = await fs.readFile(report.filePath);
      const filename = path.basename(report.filePath);
      const mimeType = this.getMimeType(report.format);

      return { stream: fileBuffer, filename, mimeType };
    } catch (error) {
      throw new NotFoundException('Report file not found');
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledReports(): Promise<void> {
    const now = new Date();
    const scheduledReports = await this.reportModel
      .find({
        status: ReportStatus.SCHEDULED,
        'schedule.isActive': true,
        'schedule.nextRunAt': { $lte: now },
      })
      .exec();

    for (const report of scheduledReports) {
      await this.generateReport(report);
      
      // Update next run time
      if (report.schedule) {
        report.schedule.nextRunAt = this.calculateNextRun(report.schedule.frequency);
        report.schedule.lastRunAt = now;
        await report.save();
      }
    }
  }

  private async generateReport(report: ReportDocument): Promise<void> {
    try {
      report.status = ReportStatus.GENERATING;
      report.startedAt = new Date();
      await report.save();

      let data: any;

      switch (report.type) {
        case ReportType.SALES:
          data = await this.generateSalesReport(report.parameters);
          break;
        case ReportType.USER_ENGAGEMENT:
          data = await this.generateUserEngagementReport(report.parameters);
          break;
        case ReportType.PRODUCT_PERFORMANCE:
          data = await this.generateProductPerformanceReport(report.parameters);
          break;
        case ReportType.FINANCIAL:
          data = await this.generateFinancialReport(report.parameters);
          break;
        case ReportType.OPERATIONAL:
          data = await this.generateOperationalReport(report.parameters);
          break;
        default:
          throw new Error(`Unsupported report type: ${report.type}`);
      }

      // Save data and generate file
      report.data = data;
      const filePath = await this.saveReportFile(report, data);
      const stats = await fs.stat(filePath);

      report.status = ReportStatus.COMPLETED;
      report.completedAt = new Date();
      report.filePath = filePath;
      report.fileSize = stats.size;
      report.metadata = {
        rowCount: Array.isArray(data.rows) ? data.rows.length : 0,
        columnCount: Array.isArray(data.columns) ? data.columns.length : 0,
        generationTime: (report.completedAt.getTime() - report.startedAt!.getTime()) / 1000,
        dataSource: 'frametale-db',
        version: '1.0',
      };

      await report.save();

    } catch (error) {
      console.error('Report generation failed:', error);
      report.status = ReportStatus.FAILED;
      report.errorMessage = error.message;
      report.completedAt = new Date();
      await report.save();
    }
  }

  private async generateSalesReport(parameters: any): Promise<any> {
    const { startDate, endDate } = parameters;
    
    // Get order statistics
    const orderStats = await this.orderService.getOrderStatistics();
    
    // Get analytics metrics
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
        0, // Would need daily order count
        0, // Would calculate AOV
      ]),
    };
  }

  private async generateUserEngagementReport(parameters: any): Promise<any> {
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

  private async generateProductPerformanceReport(parameters: any): Promise<any> {
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
        0, // Would need revenue per product
      ]),
    };
  }

  private async generateFinancialReport(parameters: any): Promise<any> {
    const { startDate, endDate } = parameters;
    const metrics = await this.analyticsService.getMetrics(startDate, endDate);

    return {
      title: 'Financial Report',
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      summary: {
        totalRevenue: metrics.totalRevenue,
        // Add more financial metrics as needed
      },
      columns: ['Date', 'Revenue'],
      rows: metrics.revenueGrowth.map(day => [day.date, day.revenue]),
    };
  }

  private async generateOperationalReport(parameters: any): Promise<any> {
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

  private async saveReportFile(report: ReportDocument, data: any): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${report.name.replace(/\s+/g, '_')}_${timestamp}`;
    
    switch (report.format) {
      case ReportFormat.CSV:
        return this.saveAsCSV(filename, data);
      case ReportFormat.EXCEL:
        return this.saveAsExcel(filename, data);
      case ReportFormat.PDF:
        return this.saveAsPDF(filename, data);
      case ReportFormat.JSON:
        return this.saveAsJSON(filename, data);
      default:
        throw new Error(`Unsupported format: ${report.format}`);
    }
  }

  private async saveAsCSV(filename: string, data: any): Promise<string> {
    const filePath = path.join(this.reportsPath, `${filename}.csv`);
    
    let csvContent = data.columns.join(',') + '\n';
    csvContent += data.rows.map((row: any[]) => row.join(',')).join('\n');
    
    await fs.writeFile(filePath, csvContent);
    return filePath;
  }

  private async saveAsExcel(filename: string, data: any): Promise<string> {
    const filePath = path.join(this.reportsPath, `${filename}.xlsx`);
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([data.columns, ...data.rows]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    XLSX.writeFile(workbook, filePath);
    return filePath;
  }

  private async saveAsPDF(filename: string, data: any): Promise<string> {
    const filePath = path.join(this.reportsPath, `${filename}.pdf`);
    
    const doc = new PDFDocument();
    const stream = require('fs').createWriteStream(filePath);
    doc.pipe(stream);
    
    // Add title
    doc.fontSize(20).text(data.title, 50, 50);
    
    // Add summary
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

  private async saveAsJSON(filename: string, data: any): Promise<string> {
    const filePath = path.join(this.reportsPath, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }

  private calculateNextRun(frequency: ReportFrequency): Date {
    const now = new Date();
    
    switch (frequency) {
      case ReportFrequency.DAILY:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case ReportFrequency.WEEKLY:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case ReportFrequency.MONTHLY:
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      case ReportFrequency.QUARTERLY:
        const nextQuarter = new Date(now);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        return nextQuarter;
      case ReportFrequency.YEARLY:
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear;
      default:
        return now;
    }
  }

  private getMimeType(format: ReportFormat): string {
    switch (format) {
      case ReportFormat.PDF:
        return 'application/pdf';
      case ReportFormat.CSV:
        return 'text/csv';
      case ReportFormat.EXCEL:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case ReportFormat.JSON:
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}
