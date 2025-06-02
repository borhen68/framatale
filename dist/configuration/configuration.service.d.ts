import { Model } from 'mongoose';
import { Configuration, ConfigurationDocument, ConfigurationType, ConfigurationScope, DataType } from './schemas/configuration.schema';
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
export declare class ConfigurationService {
    private configModel;
    private readonly encryptionKey;
    private configCache;
    private cacheExpiry;
    constructor(configModel: Model<ConfigurationDocument>);
    createConfiguration(request: CreateConfigurationRequest): Promise<Configuration>;
    updateConfiguration(key: string, updates: Partial<Configuration>, options?: GetConfigurationOptions): Promise<Configuration>;
    getConfiguration<T = any>(key: string, options?: GetConfigurationOptions): Promise<T | null>;
    getConfigurationWithDefault<T = any>(key: string, defaultValue: T, options?: GetConfigurationOptions): Promise<T>;
    getAllConfigurations(options?: GetConfigurationOptions): Promise<Configuration[]>;
    getConfigurationsByCategory(category: string, options?: GetConfigurationOptions): Promise<Configuration[]>;
    isFeatureEnabled(featureName: string, options?: GetConfigurationOptions): Promise<boolean>;
    getABTestVariant(testName: string, options?: GetConfigurationOptions): Promise<string | null>;
    deleteConfiguration(key: string, options?: GetConfigurationOptions): Promise<void>;
    bulkUpdateConfigurations(updates: Array<{
        key: string;
        value: any;
        options?: GetConfigurationOptions;
    }>): Promise<{
        updated: number;
        errors: string[];
    }>;
    getConfigurationHistory(key: string, limit?: number): Promise<any[]>;
    private buildQuery;
    private validateValue;
    private encrypt;
    private decrypt;
    private hashUserId;
    private evaluateConditions;
    private getCacheKey;
    private invalidateCache;
    private trackAccess;
    private loadCriticalConfigs;
}
