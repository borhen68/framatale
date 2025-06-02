import { ConfigurationService, CreateConfigurationRequest, GetConfigurationOptions } from './configuration.service';
import { Configuration } from './schemas/configuration.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class ConfigurationController {
    private configurationService;
    constructor(configurationService: ConfigurationService);
    createConfiguration(request: CreateConfigurationRequest): Promise<Configuration>;
    getAllConfigurations(environment?: string, includeInactive?: boolean): Promise<Configuration[]>;
    getConfigurationsByCategory(category: string, environment?: string): Promise<Configuration[]>;
    isFeatureEnabled(featureName: string, environment?: string, user?: UserDocument): Promise<{
        enabled: boolean;
    }>;
    getABTestVariant(testName: string, environment?: string, user?: UserDocument): Promise<{
        variant: string | null;
    }>;
    getUserConfigurations(environment?: string, user?: UserDocument): Promise<Configuration[]>;
    getConfiguration(key: string, environment?: string, defaultValue?: any, user?: UserDocument): Promise<{
        value: any;
    }>;
    updateConfiguration(key: string, updates: Partial<Configuration>, environment?: string): Promise<Configuration>;
    deleteConfiguration(key: string, environment?: string): Promise<{
        message: string;
    }>;
    bulkUpdateConfigurations(updates: Array<{
        key: string;
        value: any;
        options?: GetConfigurationOptions;
    }>): Promise<{
        updated: number;
        errors: string[];
    }>;
}
