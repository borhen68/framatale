import { Model } from 'mongoose';
import { ConfigurationDocument } from './schemas/configuration.schema';
import { ConfigurationService } from './configuration.service';
export interface ConfigurationTest {
    id: string;
    name: string;
    description: string;
    configKey: string;
    testType: 'validation' | 'impact' | 'rollback' | 'performance';
    testScript: string;
    expectedResult: any;
    environment: 'dev' | 'staging' | 'prod';
    isActive: boolean;
    schedule?: string;
    lastRun?: Date;
    lastResult?: ConfigurationTestResult;
}
export interface ConfigurationTestResult {
    testId: string;
    configKey: string;
    configValue: any;
    success: boolean;
    result: any;
    error?: string;
    duration: number;
    timestamp: Date;
    environment: string;
}
export interface ConfigurationAlert {
    id: string;
    type: 'validation_failed' | 'impact_detected' | 'rollback_triggered' | 'performance_degraded';
    severity: 'low' | 'medium' | 'high' | 'critical';
    configKey: string;
    message: string;
    details: any;
    timestamp: Date;
    acknowledged: boolean;
    resolvedAt?: Date;
}
export interface ConfigurationAudit {
    id: string;
    configKey: string;
    action: 'created' | 'updated' | 'deleted' | 'accessed';
    oldValue?: any;
    newValue?: any;
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    timestamp: Date;
    environment: string;
    reason?: string;
}
export declare class ConfigurationMonitoringService {
    private configModel;
    private configService;
    private tests;
    private testResults;
    private alerts;
    private audits;
    constructor(configModel: Model<ConfigurationDocument>, configService: ConfigurationService);
    createConfigurationTest(test: Omit<ConfigurationTest, 'id'>): Promise<string>;
    runConfigurationTest(testId: string): Promise<ConfigurationTestResult>;
    runAllTests(environment?: string): Promise<ConfigurationTestResult[]>;
    runScheduledTests(): Promise<void>;
    analyzeConfigurationImpact(configKey: string, newValue: any, environment?: string): Promise<any>;
    createRollbackPlan(configKey: string, environment: string): Promise<any>;
    executeRollback(configKey: string, targetValue: any, environment: string, reason: string): Promise<void>;
    monitorConfigurationPerformance(configKey: string): Promise<any>;
    createAlert(alertData: Omit<ConfigurationAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<string>;
    getAlerts(acknowledged?: boolean): Promise<ConfigurationAlert[]>;
    acknowledgeAlert(alertId: string): Promise<void>;
    auditConfigurationChange(configKey: string, action: ConfigurationAudit['action'], oldValue: any, newValue: any, userId: string, userAgent?: string, environment?: string, reason?: string): Promise<void>;
    getAuditLog(configKey?: string, limit?: number): Promise<ConfigurationAudit[]>;
    getConfigurationHealth(): Promise<any>;
    private executeTestScript;
    private initializeDefaultTests;
}
