import { Model } from 'mongoose';
import { ComplianceRecord, ComplianceRecordDocument, ComplianceType } from './schemas/compliance-record.schema';
import { UserService } from '../user/user.service';
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
export declare class ComplianceService {
    private complianceModel;
    private userService;
    constructor(complianceModel: Model<ComplianceRecordDocument>, userService: UserService);
    recordConsent(request: ConsentRequest): Promise<ComplianceRecord>;
    withdrawConsent(userId: string, consentType: ComplianceType): Promise<ComplianceRecord>;
    handleDataRequest(request: DataRequest): Promise<ComplianceRecord>;
    getUserComplianceData(userId: string): Promise<{
        consents: ComplianceRecord[];
        dataRequests: ComplianceRecord[];
        retentionSchedule: ComplianceRecord[];
    }>;
    scheduleDataRetention(userId: string, retentionPeriod: number, retentionUnit: 'days' | 'months' | 'years', reason: string): Promise<ComplianceRecord>;
    processRetentionSchedule(): Promise<void>;
    getComplianceReport(startDate: Date, endDate: Date): Promise<any>;
    private processDataRequest;
    private generateUserDataExport;
    private generatePortableUserData;
    private deleteUserData;
    private getComplianceTypeForDataRequest;
    private calculateRetentionDate;
}
