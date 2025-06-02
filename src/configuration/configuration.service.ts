import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  Configuration,
  ConfigurationDocument,
  ConfigurationType,
  ConfigurationScope,
  DataType
} from './schemas/configuration.schema';

export interface CreateConfigurationRequest {
  key: string;
  value: any;
  type: ConfigurationType;
  scope: ConfigurationScope;
  dataType: DataType;
  description?: string;
  category?: string;
  environment?: string;
  userId?: string;
  tenantId?: string;
  isEncrypted?: boolean;
  validation?: any;
  featureFlag?: any;
  abTest?: any;
  expiresAt?: Date;
}

export interface GetConfigurationOptions {
  userId?: string;
  tenantId?: string;
  environment?: string;
  includeInactive?: boolean;
}

@Injectable()
export class ConfigurationService {
  private readonly encryptionKey: string;
  private configCache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();

  constructor(
    @InjectModel(Configuration.name) private configModel: Model<ConfigurationDocument>,
  ) {
    this.encryptionKey = process.env.CONFIG_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.loadCriticalConfigs();
  }

  async createConfiguration(request: CreateConfigurationRequest): Promise<Configuration> {
    // Validate the value against data type
    this.validateValue(request.value, request.dataType);

    // Encrypt sensitive values if needed
    let value = request.value;
    if (request.isEncrypted) {
      value = this.encrypt(JSON.stringify(request.value));
    }

    const config = new this.configModel({
      ...request,
      value,
      metadata: {
        version: 1,
        createdBy: 'system', // Would be actual user in real implementation
        source: 'api',
      },
    });

    const saved = await config.save();
    this.invalidateCache(request.key, request.scope, request.environment, request.userId);
    return saved;
  }

  async updateConfiguration(
    key: string,
    updates: Partial<Configuration>,
    options: GetConfigurationOptions = {},
  ): Promise<Configuration> {
    const query = this.buildQuery(key, options);

    if (updates.value !== undefined && updates.dataType) {
      this.validateValue(updates.value, updates.dataType);
    }

    // Encrypt if needed
    if (updates.isEncrypted && updates.value !== undefined) {
      updates.value = this.encrypt(JSON.stringify(updates.value));
    }

    const config = await this.configModel
      .findOneAndUpdate(
        query,
        {
          ...updates,
          'metadata.updatedBy': 'system',
          $inc: { 'metadata.version': 1 },
        },
        { new: true }
      )
      .exec();

    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    this.invalidateCache(key, config.scope, config.environment, config.userId?.toString());
    return config;
  }

  async getConfiguration<T = any>(
    key: string,
    options: GetConfigurationOptions = {},
  ): Promise<T | null> {
    const cacheKey = this.getCacheKey(key, options);

    // Check cache first
    if (this.configCache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (Date.now() < expiry) {
        return this.configCache.get(cacheKey);
      }
    }

    const query = this.buildQuery(key, options);
    const config = await this.configModel.findOne(query).exec();

    if (!config) {
      return null;
    }

    // Track access
    this.trackAccess(config);

    let value = config.value;

    // Decrypt if needed
    if (config.isEncrypted) {
      try {
        value = JSON.parse(this.decrypt(config.value));
      } catch (error) {
        console.error('Failed to decrypt configuration:', error);
        return null;
      }
    }

    // Cache the result
    this.configCache.set(cacheKey, value);
    this.cacheExpiry.set(cacheKey, Date.now() + 5 * 60 * 1000); // 5 minutes

    return value;
  }

  async getConfigurationWithDefault<T = any>(
    key: string,
    defaultValue: T,
    options: GetConfigurationOptions = {},
  ): Promise<T> {
    const value = await this.getConfiguration<T>(key, options);
    return value !== null ? value : defaultValue;
  }

  async getAllConfigurations(options: GetConfigurationOptions = {}): Promise<Configuration[]> {
    const query: any = {};

    if (options.environment) query.environment = options.environment;
    if (options.userId) query.userId = options.userId;
    if (options.tenantId) query.tenantId = options.tenantId;
    if (!options.includeInactive) query.isActive = true;

    return this.configModel.find(query).sort({ category: 1, key: 1 }).exec();
  }

  async getConfigurationsByCategory(
    category: string,
    options: GetConfigurationOptions = {},
  ): Promise<Configuration[]> {
    const query: any = { category };

    if (options.environment) query.environment = options.environment;
    if (options.userId) query.userId = options.userId;
    if (options.tenantId) query.tenantId = options.tenantId;
    if (!options.includeInactive) query.isActive = true;

    return this.configModel.find(query).sort({ key: 1 }).exec();
  }

  async isFeatureEnabled(
    featureName: string,
    options: GetConfigurationOptions = {},
  ): Promise<boolean> {
    const config = await this.getConfiguration(featureName, options);

    if (!config || !config.featureFlag) {
      return false;
    }

    const { enabled, rolloutPercentage, targetUsers, targetGroups, conditions } = config.featureFlag;

    if (!enabled) {
      return false;
    }

    // Check target users
    if (targetUsers && options.userId && targetUsers.includes(options.userId)) {
      return true;
    }

    // Check rollout percentage
    if (rolloutPercentage !== undefined) {
      const hash = this.hashUserId(options.userId || 'anonymous');
      const userPercentage = hash % 100;
      return userPercentage < rolloutPercentage;
    }

    // Check conditions (simplified)
    if (conditions) {
      return this.evaluateConditions(conditions, options);
    }

    return enabled;
  }

  async getABTestVariant(
    testName: string,
    options: GetConfigurationOptions = {},
  ): Promise<string | null> {
    const configs = await this.configModel
      .find({
        type: ConfigurationType.AB_TEST,
        'abTest.testName': testName,
        isActive: true,
      })
      .exec();

    if (configs.length === 0) {
      return null;
    }

    // Check if test is active
    const now = new Date();
    const activeConfigs = configs.filter(config => {
      const { startDate, endDate } = config.abTest!;
      return now >= startDate && now <= endDate;
    });

    if (activeConfigs.length === 0) {
      return null;
    }

    // Determine variant based on user hash
    const hash = this.hashUserId(options.userId || 'anonymous');
    const totalPercentage = activeConfigs.reduce((sum, config) => sum + config.abTest!.percentage, 0);
    const userPercentage = hash % 100;

    let cumulativePercentage = 0;
    for (const config of activeConfigs) {
      cumulativePercentage += config.abTest!.percentage;
      if (userPercentage < cumulativePercentage) {
        return config.abTest!.variant;
      }
    }

    return null;
  }

  async deleteConfiguration(key: string, options: GetConfigurationOptions = {}): Promise<void> {
    const query = this.buildQuery(key, options);
    const result = await this.configModel.findOneAndDelete(query).exec();

    if (!result) {
      throw new NotFoundException('Configuration not found');
    }

    this.invalidateCache(key, result.scope, result.environment, result.userId?.toString());
  }

  async bulkUpdateConfigurations(
    updates: Array<{ key: string; value: any; options?: GetConfigurationOptions }>,
  ): Promise<{ updated: number; errors: string[] }> {
    let updated = 0;
    const errors: string[] = [];

    for (const update of updates) {
      try {
        await this.updateConfiguration(update.key, { value: update.value }, update.options);
        updated++;
      } catch (error) {
        errors.push(`Failed to update ${update.key}: ${error.message}`);
      }
    }

    return { updated, errors };
  }

  async getConfigurationHistory(key: string, limit: number = 10): Promise<any[]> {
    // This would require a separate audit/history collection
    // For now, return empty array
    return [];
  }

  private buildQuery(key: string, options: GetConfigurationOptions): any {
    const query: any = { key };

    if (options.environment) query.environment = options.environment;
    if (options.userId) query.userId = options.userId;
    if (options.tenantId) query.tenantId = options.tenantId;
    if (!options.includeInactive) query.isActive = true;

    return query;
  }

  private validateValue(value: any, dataType: DataType): void {
    switch (dataType) {
      case DataType.STRING:
        if (typeof value !== 'string') {
          throw new BadRequestException('Value must be a string');
        }
        break;
      case DataType.NUMBER:
        if (typeof value !== 'number') {
          throw new BadRequestException('Value must be a number');
        }
        break;
      case DataType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException('Value must be a boolean');
        }
        break;
      case DataType.ARRAY:
        if (!Array.isArray(value)) {
          throw new BadRequestException('Value must be an array');
        }
        break;
      case DataType.JSON:
        if (typeof value !== 'object' || value === null) {
          throw new BadRequestException('Value must be a valid JSON object');
        }
        break;
      case DataType.DATE:
        if (!(value instanceof Date) && !Date.parse(value)) {
          throw new BadRequestException('Value must be a valid date');
        }
        break;
    }
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private evaluateConditions(conditions: Record<string, any>, options: GetConfigurationOptions): boolean {
    // Simplified condition evaluation
    // In production, use a proper rule engine
    return true;
  }

  private getCacheKey(key: string, options: GetConfigurationOptions): string {
    return `${key}:${options.environment || 'default'}:${options.userId || 'global'}:${options.tenantId || 'default'}`;
  }

  private invalidateCache(key: string, scope: ConfigurationScope, environment?: string, userId?: string): void {
    const patterns = [
      `${key}:${environment || 'default'}:${userId || 'global'}:default`,
      `${key}:default:${userId || 'global'}:default`,
      `${key}:${environment || 'default'}:global:default`,
    ];

    patterns.forEach(pattern => {
      this.configCache.delete(pattern);
      this.cacheExpiry.delete(pattern);
    });
  }

  private async trackAccess(config: ConfigurationDocument): Promise<void> {
    // Track access asynchronously
    setImmediate(async () => {
      try {
        await this.configModel
          .updateOne(
            { _id: config._id },
            {
              $inc: { accessCount: 1 },
              $set: { lastAccessedAt: new Date() },
            }
          )
          .exec();
      } catch (error) {
        // Ignore tracking errors
      }
    });
  }

  private async loadCriticalConfigs(): Promise<void> {
    // Load critical configurations into cache on startup
    const criticalConfigs = await this.configModel
      .find({
        category: { $in: ['system', 'security', 'performance'] },
        isActive: true,
      })
      .exec();

    criticalConfigs.forEach(config => {
      const cacheKey = this.getCacheKey(config.key, {
        environment: config.environment,
        userId: config.userId?.toString(),
        tenantId: config.tenantId,
      });

      let value = config.value;
      if (config.isEncrypted) {
        try {
          value = JSON.parse(this.decrypt(config.value));
        } catch (error) {
          console.error('Failed to decrypt critical config:', config.key);
          return;
        }
      }

      this.configCache.set(cacheKey, value);
      this.cacheExpiry.set(cacheKey, Date.now() + 60 * 60 * 1000); // 1 hour for critical configs
    });
  }
}
