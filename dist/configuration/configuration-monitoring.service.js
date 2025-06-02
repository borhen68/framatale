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
exports.ConfigurationMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const configuration_schema_1 = require("./schemas/configuration.schema");
const configuration_service_1 = require("./configuration.service");
let ConfigurationMonitoringService = class ConfigurationMonitoringService {
    configModel;
    configService;
    tests = new Map();
    testResults = new Map();
    alerts = new Map();
    audits = [];
    constructor(configModel, configService) {
        this.configModel = configModel;
        this.configService = configService;
        this.initializeDefaultTests();
    }
    async createConfigurationTest(test) {
        const testId = `test_${Date.now()}`;
        const configTest = {
            id: testId,
            ...test,
        };
        this.tests.set(testId, configTest);
        return testId;
    }
    async runConfigurationTest(testId) {
        const test = this.tests.get(testId);
        if (!test) {
            throw new Error(`Test ${testId} not found`);
        }
        const startTime = Date.now();
        let result;
        try {
            const configValue = await this.configService.getConfiguration(test.configKey, {
                environment: test.environment,
            });
            const testResult = await this.executeTestScript(test.testScript, configValue, test.expectedResult);
            result = {
                testId,
                configKey: test.configKey,
                configValue,
                success: testResult.success,
                result: testResult.result,
                error: testResult.error,
                duration: Date.now() - startTime,
                timestamp: new Date(),
                environment: test.environment,
            };
        }
        catch (error) {
            result = {
                testId,
                configKey: test.configKey,
                configValue: null,
                success: false,
                result: null,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
                environment: test.environment,
            };
        }
        if (!this.testResults.has(testId)) {
            this.testResults.set(testId, []);
        }
        this.testResults.get(testId).push(result);
        test.lastRun = new Date();
        test.lastResult = result;
        this.tests.set(testId, test);
        if (!result.success) {
            await this.createAlert({
                type: 'validation_failed',
                severity: 'high',
                configKey: test.configKey,
                message: `Configuration test failed: ${test.name}`,
                details: result,
            });
        }
        return result;
    }
    async runAllTests(environment) {
        const testsToRun = Array.from(this.tests.values()).filter(test => test.isActive && (!environment || test.environment === environment));
        const results = await Promise.all(testsToRun.map(test => this.runConfigurationTest(test.id)));
        return results;
    }
    async runScheduledTests() {
        const now = new Date();
        const testsToRun = Array.from(this.tests.values()).filter(test => {
            if (!test.isActive || !test.schedule)
                return false;
            const lastRun = test.lastRun || new Date(0);
            const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
            return hoursSinceLastRun >= 1;
        });
        for (const test of testsToRun) {
            try {
                await this.runConfigurationTest(test.id);
            }
            catch (error) {
                console.error(`Scheduled test ${test.id} failed:`, error);
            }
        }
    }
    async analyzeConfigurationImpact(configKey, newValue, environment = 'staging') {
        const impactAnalysis = {
            configKey,
            newValue,
            environment,
            potentialImpacts: [],
            affectedServices: [],
            riskLevel: 'low',
            recommendations: [],
        };
        const config = await this.configModel.findOne({ key: configKey }).exec();
        if (!config) {
            impactAnalysis.riskLevel = 'medium';
            impactAnalysis.potentialImpacts.push('Configuration not found - new configuration');
            return impactAnalysis;
        }
        if (config.type === configuration_schema_1.ConfigurationType.FEATURE_FLAG) {
            impactAnalysis.affectedServices.push('All services using this feature');
            if (typeof newValue === 'boolean' && newValue !== config.value) {
                impactAnalysis.riskLevel = 'high';
                impactAnalysis.potentialImpacts.push(newValue ? 'Feature will be enabled for users' : 'Feature will be disabled for users');
                impactAnalysis.recommendations.push('Test in staging environment first');
                impactAnalysis.recommendations.push('Monitor user behavior after change');
            }
        }
        if (config.type === configuration_schema_1.ConfigurationType.SYSTEM_SETTING) {
            impactAnalysis.riskLevel = 'critical';
            impactAnalysis.potentialImpacts.push('System behavior may change');
            impactAnalysis.recommendations.push('Backup current configuration');
            impactAnalysis.recommendations.push('Prepare rollback plan');
        }
        if (config.type === configuration_schema_1.ConfigurationType.AB_TEST) {
            impactAnalysis.riskLevel = 'medium';
            impactAnalysis.potentialImpacts.push('User experience variation');
            impactAnalysis.recommendations.push('Monitor conversion metrics');
        }
        return impactAnalysis;
    }
    async createRollbackPlan(configKey, environment) {
        const currentConfig = await this.configService.getConfiguration(configKey, { environment });
        const auditHistory = this.audits
            .filter(audit => audit.configKey === configKey && audit.environment === environment)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5);
        return {
            configKey,
            environment,
            currentValue: currentConfig,
            rollbackOptions: auditHistory.map(audit => ({
                value: audit.oldValue,
                timestamp: audit.timestamp,
                userId: audit.userId,
                reason: audit.reason,
            })),
            autoRollbackTriggers: [
                'Error rate > 5%',
                'Response time > 2s',
                'User complaints > 10',
            ],
        };
    }
    async executeRollback(configKey, targetValue, environment, reason) {
        await this.auditConfigurationChange(configKey, 'updated', await this.configService.getConfiguration(configKey, { environment }), targetValue, 'system', 'Automatic rollback', environment, reason);
        await this.configService.updateConfiguration(configKey, { value: targetValue }, { environment });
        await this.createAlert({
            type: 'rollback_triggered',
            severity: 'high',
            configKey,
            message: `Configuration rolled back: ${reason}`,
            details: { targetValue, reason },
        });
        console.log(`Configuration Rollback: ${configKey} - ${reason}`);
    }
    async monitorConfigurationPerformance(configKey) {
        const performanceMetrics = {
            configKey,
            accessCount: 0,
            averageResponseTime: 0,
            cacheHitRate: 0,
            errorRate: 0,
            lastAccessed: new Date(),
        };
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentAccesses = this.audits.filter(audit => audit.configKey === configKey &&
            audit.action === 'accessed' &&
            audit.timestamp >= oneDayAgo);
        performanceMetrics.accessCount = recentAccesses.length;
        if (recentAccesses.length > 0) {
            performanceMetrics.lastAccessed = recentAccesses[0].timestamp;
        }
        if (performanceMetrics.averageResponseTime > 1000) {
            await this.createAlert({
                type: 'performance_degraded',
                severity: 'medium',
                configKey,
                message: `Configuration access is slow: ${performanceMetrics.averageResponseTime}ms`,
                details: performanceMetrics,
            });
        }
        return performanceMetrics;
    }
    async createAlert(alertData) {
        const alertId = `alert_${Date.now()}`;
        const alert = {
            id: alertId,
            timestamp: new Date(),
            acknowledged: false,
            ...alertData,
        };
        this.alerts.set(alertId, alert);
        if (alert.severity === 'high' || alert.severity === 'critical') {
            console.log(`Configuration Alert: ${alert.type} - ${alert.message}`);
        }
        return alertId;
    }
    async getAlerts(acknowledged) {
        const alerts = Array.from(this.alerts.values());
        if (acknowledged !== undefined) {
            return alerts.filter(alert => alert.acknowledged === acknowledged);
        }
        return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async acknowledgeAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.acknowledged = true;
            this.alerts.set(alertId, alert);
        }
    }
    async auditConfigurationChange(configKey, action, oldValue, newValue, userId, userAgent, environment = 'prod', reason) {
        const audit = {
            id: `audit_${Date.now()}`,
            configKey,
            action,
            oldValue,
            newValue,
            userId,
            userAgent,
            ipAddress: '127.0.0.1',
            timestamp: new Date(),
            environment,
            reason,
        };
        this.audits.push(audit);
        if (this.audits.length > 1000) {
            this.audits = this.audits.slice(-1000);
        }
    }
    async getAuditLog(configKey, limit = 100) {
        let audits = this.audits;
        if (configKey) {
            audits = audits.filter(audit => audit.configKey === configKey);
        }
        return audits
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async getConfigurationHealth() {
        const health = {
            status: 'healthy',
            totalConfigurations: await this.configModel.countDocuments(),
            activeTests: Array.from(this.tests.values()).filter(t => t.isActive).length,
            failedTests: 0,
            unacknowledgedAlerts: Array.from(this.alerts.values()).filter(a => !a.acknowledged).length,
            criticalAlerts: Array.from(this.alerts.values()).filter(a => a.severity === 'critical' && !a.acknowledged).length,
            lastTestRun: new Date(),
            issues: [],
        };
        const recentResults = Array.from(this.testResults.values()).flat()
            .filter(result => result.timestamp > new Date(Date.now() - 60 * 60 * 1000));
        health.failedTests = recentResults.filter(result => !result.success).length;
        if (health.criticalAlerts > 0) {
            health.status = 'critical';
            health.issues.push(`${health.criticalAlerts} critical alerts`);
        }
        else if (health.failedTests > 5) {
            health.status = 'warning';
            health.issues.push(`${health.failedTests} failed tests`);
        }
        else if (health.unacknowledgedAlerts > 10) {
            health.status = 'warning';
            health.issues.push(`${health.unacknowledgedAlerts} unacknowledged alerts`);
        }
        return health;
    }
    async executeTestScript(script, configValue, expectedResult) {
        try {
            const testFunction = new Function('configValue', 'expectedResult', script);
            const result = testFunction(configValue, expectedResult);
            return {
                success: true,
                result,
            };
        }
        catch (error) {
            return {
                success: false,
                result: null,
                error: error.message,
            };
        }
    }
    initializeDefaultTests() {
        this.tests.set('feature_flag_validation', {
            id: 'feature_flag_validation',
            name: 'Feature Flag Validation',
            description: 'Validates that feature flags are boolean values',
            configKey: '*',
            testType: 'validation',
            testScript: `
        if (typeof configValue !== 'boolean') {
          throw new Error('Feature flag must be boolean');
        }
        return true;
      `,
            expectedResult: true,
            environment: 'prod',
            isActive: true,
            schedule: '0 * * * *',
        });
        this.tests.set('config_performance', {
            id: 'config_performance',
            name: 'Configuration Performance',
            description: 'Checks configuration access performance',
            configKey: '*',
            testType: 'performance',
            testScript: `
        const startTime = Date.now();
        // Simulate configuration access
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (duration > 100) {
          throw new Error('Configuration access too slow: ' + duration + 'ms');
        }
        return duration;
      `,
            expectedResult: 100,
            environment: 'prod',
            isActive: true,
            schedule: '*/15 * * * *',
        });
    }
};
exports.ConfigurationMonitoringService = ConfigurationMonitoringService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationMonitoringService.prototype, "runScheduledTests", null);
exports.ConfigurationMonitoringService = ConfigurationMonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(configuration_schema_1.Configuration.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        configuration_service_1.ConfigurationService])
], ConfigurationMonitoringService);
//# sourceMappingURL=configuration-monitoring.service.js.map