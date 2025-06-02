import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Configuration, ConfigurationDocument, ConfigurationType } from './schemas/configuration.schema';
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
  schedule?: string; // cron expression
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

@Injectable()
export class ConfigurationMonitoringService {
  private tests: Map<string, ConfigurationTest> = new Map();
  private testResults: Map<string, ConfigurationTestResult[]> = new Map();
  private alerts: Map<string, ConfigurationAlert> = new Map();
  private audits: ConfigurationAudit[] = [];

  constructor(
    @InjectModel(Configuration.name) private configModel: Model<ConfigurationDocument>,
    private configService: ConfigurationService,
  ) {
    this.initializeDefaultTests();
  }

  // Configuration Testing
  async createConfigurationTest(test: Omit<ConfigurationTest, 'id'>): Promise<string> {
    const testId = `test_${Date.now()}`;
    const configTest: ConfigurationTest = {
      id: testId,
      ...test,
    };

    this.tests.set(testId, configTest);
    return testId;
  }

  async runConfigurationTest(testId: string): Promise<ConfigurationTestResult> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    const startTime = Date.now();
    let result: ConfigurationTestResult;

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
    } catch (error) {
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

    // Store test result
    if (!this.testResults.has(testId)) {
      this.testResults.set(testId, []);
    }
    this.testResults.get(testId)!.push(result);

    // Update test last run
    test.lastRun = new Date();
    test.lastResult = result;
    this.tests.set(testId, test);

    // Create alert if test failed
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

  async runAllTests(environment?: string): Promise<ConfigurationTestResult[]> {
    const testsToRun = Array.from(this.tests.values()).filter(test =>
      test.isActive && (!environment || test.environment === environment)
    );

    const results = await Promise.all(
      testsToRun.map(test => this.runConfigurationTest(test.id))
    );

    return results;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async runScheduledTests(): Promise<void> {
    const now = new Date();
    const testsToRun = Array.from(this.tests.values()).filter(test => {
      if (!test.isActive || !test.schedule) return false;

      // Simple cron check (in production, use a proper cron parser)
      const lastRun = test.lastRun || new Date(0);
      const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

      return hoursSinceLastRun >= 1; // Run if more than 1 hour since last run
    });

    for (const test of testsToRun) {
      try {
        await this.runConfigurationTest(test.id);
      } catch (error) {
        console.error(`Scheduled test ${test.id} failed:`, error);
      }
    }
  }

  // Configuration Impact Analysis
  async analyzeConfigurationImpact(
    configKey: string,
    newValue: any,
    environment: string = 'staging',
  ): Promise<any> {
    const impactAnalysis = {
      configKey,
      newValue,
      environment,
      potentialImpacts: [] as string[],
      affectedServices: [] as string[],
      riskLevel: 'low' as 'low' | 'medium' | 'high' | 'critical',
      recommendations: [] as string[],
    };

    // Analyze based on configuration type and key
    const config = await this.configModel.findOne({ key: configKey }).exec();
    if (!config) {
      impactAnalysis.riskLevel = 'medium';
      impactAnalysis.potentialImpacts.push('Configuration not found - new configuration');
      return impactAnalysis;
    }

    // Feature flag impact analysis
    if (config.type === ConfigurationType.FEATURE_FLAG) {
      impactAnalysis.affectedServices.push('All services using this feature');

      if (typeof newValue === 'boolean' && newValue !== config.value) {
        impactAnalysis.riskLevel = 'high';
        impactAnalysis.potentialImpacts.push(
          newValue ? 'Feature will be enabled for users' : 'Feature will be disabled for users'
        );
        impactAnalysis.recommendations.push('Test in staging environment first');
        impactAnalysis.recommendations.push('Monitor user behavior after change');
      }
    }

    // System setting impact analysis
    if (config.type === ConfigurationType.SYSTEM_SETTING) {
      impactAnalysis.riskLevel = 'critical';
      impactAnalysis.potentialImpacts.push('System behavior may change');
      impactAnalysis.recommendations.push('Backup current configuration');
      impactAnalysis.recommendations.push('Prepare rollback plan');
    }

    // A/B test impact analysis
    if (config.type === ConfigurationType.AB_TEST) {
      impactAnalysis.riskLevel = 'medium';
      impactAnalysis.potentialImpacts.push('User experience variation');
      impactAnalysis.recommendations.push('Monitor conversion metrics');
    }

    return impactAnalysis;
  }

  // Configuration Rollback
  async createRollbackPlan(configKey: string, environment: string): Promise<any> {
    const currentConfig = await this.configService.getConfiguration(configKey, { environment });
    const auditHistory = this.audits
      .filter(audit => audit.configKey === configKey && audit.environment === environment)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5); // Last 5 changes

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

  async executeRollback(configKey: string, targetValue: any, environment: string, reason: string): Promise<void> {
    // Create audit entry
    await this.auditConfigurationChange(
      configKey,
      'updated',
      await this.configService.getConfiguration(configKey, { environment }),
      targetValue,
      'system',
      'Automatic rollback',
      environment,
      reason,
    );

    // Update configuration
    await this.configService.updateConfiguration(
      configKey,
      { value: targetValue },
      { environment }
    );

    // Create alert
    await this.createAlert({
      type: 'rollback_triggered',
      severity: 'high',
      configKey,
      message: `Configuration rolled back: ${reason}`,
      details: { targetValue, reason },
    });

    // Send notification (placeholder - would integrate with email service)
    console.log(`Configuration Rollback: ${configKey} - ${reason}`);
    // TODO: Integrate with email service
  }

  // Performance Monitoring
  async monitorConfigurationPerformance(configKey: string): Promise<any> {
    const performanceMetrics = {
      configKey,
      accessCount: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      lastAccessed: new Date(),
    };

    // Get performance data from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAccesses = this.audits.filter(
      audit => audit.configKey === configKey &&
               audit.action === 'accessed' &&
               audit.timestamp >= oneDayAgo
    );

    performanceMetrics.accessCount = recentAccesses.length;

    if (recentAccesses.length > 0) {
      performanceMetrics.lastAccessed = recentAccesses[0].timestamp;
    }

    // Check if performance is degraded
    if (performanceMetrics.averageResponseTime > 1000) { // 1 second
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

  // Alert Management
  async createAlert(alertData: Omit<ConfigurationAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<string> {
    const alertId = `alert_${Date.now()}`;
    const alert: ConfigurationAlert = {
      id: alertId,
      timestamp: new Date(),
      acknowledged: false,
      ...alertData,
    };

    this.alerts.set(alertId, alert);

    // Send notification for high/critical alerts (placeholder)
    if (alert.severity === 'high' || alert.severity === 'critical') {
      console.log(`Configuration Alert: ${alert.type} - ${alert.message}`);
      // TODO: Integrate with email service
    }

    return alertId;
  }

  async getAlerts(acknowledged?: boolean): Promise<ConfigurationAlert[]> {
    const alerts = Array.from(this.alerts.values());

    if (acknowledged !== undefined) {
      return alerts.filter(alert => alert.acknowledged === acknowledged);
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(alertId, alert);
    }
  }

  // Audit Logging
  async auditConfigurationChange(
    configKey: string,
    action: ConfigurationAudit['action'],
    oldValue: any,
    newValue: any,
    userId: string,
    userAgent?: string,
    environment: string = 'prod',
    reason?: string,
  ): Promise<void> {
    const audit: ConfigurationAudit = {
      id: `audit_${Date.now()}`,
      configKey,
      action,
      oldValue,
      newValue,
      userId,
      userAgent,
      ipAddress: '127.0.0.1', // Would get from request
      timestamp: new Date(),
      environment,
      reason,
    };

    this.audits.push(audit);

    // Keep only last 1000 audit entries
    if (this.audits.length > 1000) {
      this.audits = this.audits.slice(-1000);
    }
  }

  async getAuditLog(configKey?: string, limit: number = 100): Promise<ConfigurationAudit[]> {
    let audits = this.audits;

    if (configKey) {
      audits = audits.filter(audit => audit.configKey === configKey);
    }

    return audits
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Health Check
  async getConfigurationHealth(): Promise<any> {
    const health = {
      status: 'healthy',
      totalConfigurations: await this.configModel.countDocuments(),
      activeTests: Array.from(this.tests.values()).filter(t => t.isActive).length,
      failedTests: 0,
      unacknowledgedAlerts: Array.from(this.alerts.values()).filter(a => !a.acknowledged).length,
      criticalAlerts: Array.from(this.alerts.values()).filter(a => a.severity === 'critical' && !a.acknowledged).length,
      lastTestRun: new Date(),
      issues: [] as string[],
    };

    // Check for failed tests
    const recentResults = Array.from(this.testResults.values()).flat()
      .filter(result => result.timestamp > new Date(Date.now() - 60 * 60 * 1000)); // Last hour

    health.failedTests = recentResults.filter(result => !result.success).length;

    // Determine overall health status
    if (health.criticalAlerts > 0) {
      health.status = 'critical';
      health.issues.push(`${health.criticalAlerts} critical alerts`);
    } else if (health.failedTests > 5) {
      health.status = 'warning';
      health.issues.push(`${health.failedTests} failed tests`);
    } else if (health.unacknowledgedAlerts > 10) {
      health.status = 'warning';
      health.issues.push(`${health.unacknowledgedAlerts} unacknowledged alerts`);
    }

    return health;
  }

  // Private helper methods
  private async executeTestScript(script: string, configValue: any, expectedResult: any): Promise<any> {
    try {
      // Simple test execution (in production, use a sandboxed environment)
      const testFunction = new Function('configValue', 'expectedResult', script);
      const result = testFunction(configValue, expectedResult);

      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error.message,
      };
    }
  }

  private initializeDefaultTests(): void {
    // Feature flag validation test
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
      schedule: '0 * * * *', // Every hour
    });

    // Performance test
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
      schedule: '*/15 * * * *', // Every 15 minutes
    });
  }
}
