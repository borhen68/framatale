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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const compliance_record_schema_1 = require("./schemas/compliance-record.schema");
const user_service_1 = require("../user/user.service");
let ComplianceService = class ComplianceService {
    complianceModel;
    userService;
    constructor(complianceModel, userService) {
        this.complianceModel = complianceModel;
        this.userService = userService;
    }
    async recordConsent(request) {
        const record = new this.complianceModel({
            type: request.consentType,
            status: compliance_record_schema_1.ComplianceStatus.COMPLETED,
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
    async withdrawConsent(userId, consentType) {
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
            throw new common_1.NotFoundException('Original consent record not found');
        }
        originalConsent.consent.consentWithdrawn = true;
        originalConsent.consent.withdrawalDate = new Date();
        await originalConsent.save();
        const withdrawalRecord = new this.complianceModel({
            type: consentType,
            status: compliance_record_schema_1.ComplianceStatus.COMPLETED,
            userId,
            userEmail: originalConsent.userEmail,
            data: {
                action: 'consent_withdrawal',
                originalRecordId: originalConsent._id,
            },
            consent: {
                consentGiven: false,
                consentWithdrawn: true,
                consentDate: originalConsent.consent.consentDate,
                withdrawalDate: new Date(),
                consentMethod: 'withdrawal',
                consentVersion: originalConsent.consent.consentVersion,
            },
            relatedRecords: [originalConsent._id],
            isVerified: true,
            verifiedAt: new Date(),
        });
        return withdrawalRecord.save();
    }
    async handleDataRequest(request) {
        const complianceType = this.getComplianceTypeForDataRequest(request.requestType);
        const record = new this.complianceModel({
            type: complianceType,
            status: compliance_record_schema_1.ComplianceStatus.PENDING,
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
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        const savedRecord = await record.save();
        this.processDataRequest(savedRecord).catch(console.error);
        return savedRecord;
    }
    async getUserComplianceData(userId) {
        const consents = await this.complianceModel
            .find({
            userId,
            type: { $in: [compliance_record_schema_1.ComplianceType.GDPR_CONSENT, compliance_record_schema_1.ComplianceType.CCPA_CONSENT, compliance_record_schema_1.ComplianceType.COOKIE_CONSENT] },
        })
            .sort({ createdAt: -1 })
            .exec();
        const dataRequests = await this.complianceModel
            .find({
            userId,
            type: { $in: [compliance_record_schema_1.ComplianceType.GDPR_DATA_REQUEST, compliance_record_schema_1.ComplianceType.CCPA_DATA_REQUEST] },
        })
            .sort({ createdAt: -1 })
            .exec();
        const retentionSchedule = await this.complianceModel
            .find({
            userId,
            type: compliance_record_schema_1.ComplianceType.DATA_RETENTION,
        })
            .sort({ createdAt: -1 })
            .exec();
        return { consents, dataRequests, retentionSchedule };
    }
    async scheduleDataRetention(userId, retentionPeriod, retentionUnit, reason) {
        const scheduledDeletion = this.calculateRetentionDate(retentionPeriod, retentionUnit);
        const record = new this.complianceModel({
            type: compliance_record_schema_1.ComplianceType.DATA_RETENTION,
            status: compliance_record_schema_1.ComplianceStatus.PENDING,
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
    async processRetentionSchedule() {
        const now = new Date();
        const recordsToDelete = await this.complianceModel
            .find({
            type: compliance_record_schema_1.ComplianceType.DATA_RETENTION,
            status: compliance_record_schema_1.ComplianceStatus.PENDING,
            'retention.scheduledDeletion': { $lte: now },
        })
            .exec();
        for (const record of recordsToDelete) {
            try {
                if (record.userId) {
                    await this.deleteUserData(record.userId.toString());
                    record.status = compliance_record_schema_1.ComplianceStatus.COMPLETED;
                    record.retention.actualDeletion = new Date();
                    await record.save();
                }
            }
            catch (error) {
                console.error(`Failed to delete user data for ${record.userId}:`, error);
            }
        }
    }
    async getComplianceReport(startDate, endDate) {
        const consentStats = await this.complianceModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    type: { $in: [compliance_record_schema_1.ComplianceType.GDPR_CONSENT, compliance_record_schema_1.ComplianceType.CCPA_CONSENT] },
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
                    type: { $in: [compliance_record_schema_1.ComplianceType.GDPR_DATA_REQUEST, compliance_record_schema_1.ComplianceType.CCPA_DATA_REQUEST] },
                },
            },
            {
                $group: {
                    _id: '$request.requestType',
                    count: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$status', compliance_record_schema_1.ComplianceStatus.PENDING] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ['$status', compliance_record_schema_1.ComplianceStatus.COMPLETED] }, 1, 0] } },
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
    async processDataRequest(record) {
        try {
            let responseData = {};
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
                    responseData = { requiresManualReview: true };
                    break;
            }
            record.status = compliance_record_schema_1.ComplianceStatus.COMPLETED;
            record.request.responseDate = new Date();
            record.request.responseData = responseData;
            await record.save();
        }
        catch (error) {
            record.status = compliance_record_schema_1.ComplianceStatus.REJECTED;
            record.notes = `Processing failed: ${error.message}`;
            await record.save();
        }
    }
    async generateUserDataExport(userId) {
        if (!userId)
            return {};
        const userData = await this.userService.findById(userId);
        return {
            user: userData,
            exportDate: new Date(),
            format: 'json',
        };
    }
    async generatePortableUserData(userId) {
        const exportData = await this.generateUserDataExport(userId);
        return {
            ...exportData,
            format: 'portable',
            machineReadable: true,
        };
    }
    async deleteUserData(userId) {
        console.log(`Deleting all data for user ${userId}`);
    }
    getComplianceTypeForDataRequest(requestType) {
        switch (requestType) {
            case 'access':
            case 'portability':
            case 'deletion':
            case 'rectification':
                return compliance_record_schema_1.ComplianceType.GDPR_DATA_REQUEST;
            default:
                return compliance_record_schema_1.ComplianceType.GDPR_DATA_REQUEST;
        }
    }
    calculateRetentionDate(period, unit) {
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
};
exports.ComplianceService = ComplianceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceService.prototype, "processRetentionSchedule", null);
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(compliance_record_schema_1.ComplianceRecord.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map