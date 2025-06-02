import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ComplianceRecord, ComplianceRecordDocument, ComplianceType, ComplianceStatus } from './schemas/compliance-record.schema';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schemas/user.schema';

export interface ConsentRequest {
  userId?: string;
  userEmail: string;
  consentType: ComplianceType;
  consentGiven: boolean;
  ipAddress?: string;
  userAgent?: string;
  consentMethod: string;
  consentVersion: string;
  legalBasis?: string;
}

export interface DataRequest {
  userId?: string;
  userEmail: string;
  requestType: 'access' | 'portability' | 'deletion' | 'rectification';
  verificationMethod: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ComplianceService {
  constructor(
    @InjectModel(ComplianceRecord.name) private complianceModel: Model<ComplianceRecordDocument>,
    private userService: UserService,
  ) {}

  async recordConsent(request: ConsentRequest): Promise<ComplianceRecord> {
    const record = new this.complianceModel({
      type: request.consentType,
      status: ComplianceStatus.COMPLETED,
      userId: request.userId,
      userEmail: request.userEmail,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      legalBasis: request.legalBasis || 'consent',
      data: {
        consentType: request.consentType,
        method: request.consentMethod,
        version: request.consentVersion,
      },
      consent: {
        consentGiven: request.consentGiven,
        consentWithdrawn: false,
        consentDate: new Date(),
        consentMethod: request.consentMethod,
        consentVersion: request.consentVersion,
      },
      isVerified: true,
      verifiedAt: new Date(),
    });

    return record.save();
  }

  async withdrawConsent(userId: string, consentType: ComplianceType): Promise<ComplianceRecord> {
    // Find the original consent record
    const originalConsent = await this.complianceModel
      .findOne({
        userId,
        type: consentType,
        'consent.consentGiven': true,
        'consent.consentWithdrawn': false,
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!originalConsent) {
      throw new NotFoundException('Original consent record not found');
    }

    // Update original record
    originalConsent.consent!.consentWithdrawn = true;
    originalConsent.consent!.withdrawalDate = new Date();
    await originalConsent.save();

    // Create withdrawal record
    const withdrawalRecord = new this.complianceModel({
      type: consentType,
      status: ComplianceStatus.COMPLETED,
      userId,
      userEmail: originalConsent.userEmail,
      data: {
        action: 'consent_withdrawal',
        originalRecordId: originalConsent._id,
      },
      consent: {
        consentGiven: false,
        consentWithdrawn: true,
        consentDate: originalConsent.consent!.consentDate,
        withdrawalDate: new Date(),
        consentMethod: 'withdrawal',
        consentVersion: originalConsent.consent!.consentVersion,
      },
      relatedRecords: [originalConsent._id],
      isVerified: true,
      verifiedAt: new Date(),
    });

    return withdrawalRecord.save();
  }

  async handleDataRequest(request: DataRequest): Promise<ComplianceRecord> {
    const complianceType = this.getComplianceTypeForDataRequest(request.requestType);

    const record = new this.complianceModel({
      type: complianceType,
      status: ComplianceStatus.PENDING,
      userId: request.userId,
      userEmail: request.userEmail,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      data: {
        requestType: request.requestType,
        verificationMethod: request.verificationMethod,
      },
      request: {
        requestType: request.requestType,
        requestDate: new Date(),
        requestMethod: 'api',
        verificationMethod: request.verificationMethod,
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days to respond
    });

    const savedRecord = await record.save();

    // Process the request asynchronously
    this.processDataRequest(savedRecord).catch(console.error);

    return savedRecord;
  }

  async getUserComplianceData(userId: string): Promise<{
    consents: ComplianceRecord[];
    dataRequests: ComplianceRecord[];
    retentionSchedule: ComplianceRecord[];
  }> {
    const consents = await this.complianceModel
      .find({
        userId,
        type: { $in: [ComplianceType.GDPR_CONSENT, ComplianceType.CCPA_CONSENT, ComplianceType.COOKIE_CONSENT] },
      })
      .sort({ createdAt: -1 })
      .exec();

    const dataRequests = await this.complianceModel
      .find({
        userId,
        type: { $in: [ComplianceType.GDPR_DATA_REQUEST, ComplianceType.CCPA_DATA_REQUEST] },
      })
      .sort({ createdAt: -1 })
      .exec();

    const retentionSchedule = await this.complianceModel
      .find({
        userId,
        type: ComplianceType.DATA_RETENTION,
      })
      .sort({ createdAt: -1 })
      .exec();

    return { consents, dataRequests, retentionSchedule };
  }

  async scheduleDataRetention(
    userId: string,
    retentionPeriod: number,
    retentionUnit: 'days' | 'months' | 'years',
    reason: string,
  ): Promise<ComplianceRecord> {
    const scheduledDeletion = this.calculateRetentionDate(retentionPeriod, retentionUnit);

    const record = new this.complianceModel({
      type: ComplianceType.DATA_RETENTION,
      status: ComplianceStatus.PENDING,
      userId,
      data: {
        retentionPeriod,
        retentionUnit,
        reason,
      },
      retention: {
        retentionPeriod,
        retentionUnit,
        retentionReason: reason,
        scheduledDeletion,
      },
      expiresAt: scheduledDeletion,
    });

    return record.save();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processRetentionSchedule(): Promise<void> {
    const now = new Date();
    const recordsToDelete = await this.complianceModel
      .find({
        type: ComplianceType.DATA_RETENTION,
        status: ComplianceStatus.PENDING,
        'retention.scheduledDeletion': { $lte: now },
      })
      .exec();

    for (const record of recordsToDelete) {
      try {
        if (record.userId) {
          await this.deleteUserData(record.userId.toString());

          record.status = ComplianceStatus.COMPLETED;
          record.retention!.actualDeletion = new Date();
          await record.save();
        }
      } catch (error) {
        console.error(`Failed to delete user data for ${record.userId}:`, error);
      }
    }
  }

  async getComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const consentStats = await this.complianceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          type: { $in: [ComplianceType.GDPR_CONSENT, ComplianceType.CCPA_CONSENT] },
        },
      },
      {
        $group: {
          _id: '$type',
          given: { $sum: { $cond: ['$consent.consentGiven', 1, 0] } },
          withdrawn: { $sum: { $cond: ['$consent.consentWithdrawn', 1, 0] } },
        },
      },
    ]);

    const dataRequestStats = await this.complianceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          type: { $in: [ComplianceType.GDPR_DATA_REQUEST, ComplianceType.CCPA_DATA_REQUEST] },
        },
      },
      {
        $group: {
          _id: '$request.requestType',
          count: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', ComplianceStatus.PENDING] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', ComplianceStatus.COMPLETED] }, 1, 0] } },
        },
      },
    ]);

    return {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      consentStats,
      dataRequestStats,
      totalRecords: await this.complianceModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
    };
  }

  private async processDataRequest(record: ComplianceRecordDocument): Promise<void> {
    try {
      let responseData: any = {};

      switch (record.request?.requestType) {
        case 'access':
          responseData = await this.generateUserDataExport(record.userId?.toString());
          break;
        case 'portability':
          responseData = await this.generatePortableUserData(record.userId?.toString());
          break;
        case 'deletion':
          if (record.userId) {
            await this.deleteUserData(record.userId.toString());
          }
          responseData = { deleted: true, deletionDate: new Date() };
          break;
        case 'rectification':
          // This would require manual intervention
          responseData = { requiresManualReview: true };
          break;
      }

      record.status = ComplianceStatus.COMPLETED;
      record.request!.responseDate = new Date();
      record.request!.responseData = responseData;
      await record.save();

    } catch (error) {
      record.status = ComplianceStatus.REJECTED;
      record.notes = `Processing failed: ${error.message}`;
      await record.save();
    }
  }

  private async generateUserDataExport(userId?: string): Promise<any> {
    if (!userId) return {};

    // Collect all user data from various services
    const userData = await this.userService.findById(userId);
    // Add more data collection from other services as needed

    return {
      user: userData,
      exportDate: new Date(),
      format: 'json',
    };
  }

  private async generatePortableUserData(userId?: string): Promise<any> {
    const exportData = await this.generateUserDataExport(userId);

    return {
      ...exportData,
      format: 'portable',
      machineReadable: true,
    };
  }

  private async deleteUserData(userId: string): Promise<void> {
    // This would cascade delete user data across all services
    // Implementation depends on your data architecture
    console.log(`Deleting all data for user ${userId}`);

    // Example: Delete user and related data
    // await this.userService.delete(userId);
    // await this.projectService.deleteUserProjects(userId);
    // etc.
  }

  private getComplianceTypeForDataRequest(requestType: string): ComplianceType {
    switch (requestType) {
      case 'access':
      case 'portability':
      case 'deletion':
      case 'rectification':
        return ComplianceType.GDPR_DATA_REQUEST;
      default:
        return ComplianceType.GDPR_DATA_REQUEST;
    }
  }

  private calculateRetentionDate(period: number, unit: 'days' | 'months' | 'years'): Date {
    const now = new Date();

    switch (unit) {
      case 'days':
        return new Date(now.getTime() + period * 24 * 60 * 60 * 1000);
      case 'months':
        const monthsLater = new Date(now);
        monthsLater.setMonth(monthsLater.getMonth() + period);
        return monthsLater;
      case 'years':
        const yearsLater = new Date(now);
        yearsLater.setFullYear(yearsLater.getFullYear() + period);
        return yearsLater;
      default:
        return now;
    }
  }
}
