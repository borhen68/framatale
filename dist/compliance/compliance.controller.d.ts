import { ComplianceService, ConsentRequest, DataRequest } from './compliance.service';
import { ComplianceRecord, ComplianceType } from './schemas/compliance-record.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class ComplianceController {
    private complianceService;
    constructor(complianceService: ComplianceService);
    recordConsent(request: ConsentRequest): Promise<ComplianceRecord>;
    withdrawConsent(consentType: ComplianceType, user: UserDocument): Promise<ComplianceRecord>;
    submitDataRequest(request: DataRequest): Promise<ComplianceRecord>;
    getUserComplianceData(userId: string): Promise<any>;
    getMyComplianceData(user: UserDocument): Promise<any>;
    scheduleDataRetention(request: {
        userId: string;
        retentionPeriod: number;
        retentionUnit: 'days' | 'months' | 'years';
        reason: string;
    }): Promise<ComplianceRecord>;
    getComplianceReport(startDate: string, endDate: string): Promise<any>;
}
