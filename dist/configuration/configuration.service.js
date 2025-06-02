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
exports.ConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = require("crypto");
const configuration_schema_1 = require("./schemas/configuration.schema");
let ConfigurationService = class ConfigurationService {
    configModel;
    encryptionKey;
    configCache = new Map();
    cacheExpiry = new Map();
    constructor(configModel) {
        this.configModel = configModel;
        this.encryptionKey = process.env.CONFIG_ENCRYPTION_KEY || 'default-key-change-in-production';
        this.loadCriticalConfigs();
    }
    async createConfiguration(request) {
        this.validateValue(request.value, request.dataType);
        let value = request.value;
        if (request.isEncrypted) {
            value = this.encrypt(JSON.stringify(request.value));
        }
        const config = new this.configModel({
            ...request,
            value,
            metadata: {
                version: 1,
                createdBy: 'system',
                source: 'api',
            },
        });
        const saved = await config.save();
        this.invalidateCache(request.key, request.scope, request.environment, request.userId);
        return saved;
    }
    async updateConfiguration(key, updates, options = {}) {
        const query = this.buildQuery(key, options);
        if (updates.value !== undefined && updates.dataType) {
            this.validateValue(updates.value, updates.dataType);
        }
        if (updates.isEncrypted && updates.value !== undefined) {
            updates.value = this.encrypt(JSON.stringify(updates.value));
        }
        const config = await this.configModel
            .findOneAndUpdate(query, {
            ...updates,
            'metadata.updatedBy': 'system',
            $inc: { 'metadata.version': 1 },
        }, { new: true })
            .exec();
        if (!config) {
            throw new common_1.NotFoundException('Configuration not found');
        }
        this.invalidateCache(key, config.scope, config.environment, config.userId?.toString());
        return config;
    }
    async getConfiguration(key, options = {}) {
        const cacheKey = this.getCacheKey(key, options);
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
        this.trackAccess(config);
        let value = config.value;
        if (config.isEncrypted) {
            try {
                value = JSON.parse(this.decrypt(config.value));
            }
            catch (error) {
                console.error('Failed to decrypt configuration:', error);
                return null;
            }
        }
        this.configCache.set(cacheKey, value);
        this.cacheExpiry.set(cacheKey, Date.now() + 5 * 60 * 1000);
        return value;
    }
    async getConfigurationWithDefault(key, defaultValue, options = {}) {
        const value = await this.getConfiguration(key, options);
        return value !== null ? value : defaultValue;
    }
    async getAllConfigurations(options = {}) {
        const query = {};
        if (options.environment)
            query.environment = options.environment;
        if (options.userId)
            query.userId = options.userId;
        if (options.tenantId)
            query.tenantId = options.tenantId;
        if (!options.includeInactive)
            query.isActive = true;
        return this.configModel.find(query).sort({ category: 1, key: 1 }).exec();
    }
    async getConfigurationsByCategory(category, options = {}) {
        const query = { category };
        if (options.environment)
            query.environment = options.environment;
        if (options.userId)
            query.userId = options.userId;
        if (options.tenantId)
            query.tenantId = options.tenantId;
        if (!options.includeInactive)
            query.isActive = true;
        return this.configModel.find(query).sort({ key: 1 }).exec();
    }
    async isFeatureEnabled(featureName, options = {}) {
        const config = await this.getConfiguration(featureName, options);
        if (!config || !config.featureFlag) {
            return false;
        }
        const { enabled, rolloutPercentage, targetUsers, targetGroups, conditions } = config.featureFlag;
        if (!enabled) {
            return false;
        }
        if (targetUsers && options.userId && targetUsers.includes(options.userId)) {
            return true;
        }
        if (rolloutPercentage !== undefined) {
            const hash = this.hashUserId(options.userId || 'anonymous');
            const userPercentage = hash % 100;
            return userPercentage < rolloutPercentage;
        }
        if (conditions) {
            return this.evaluateConditions(conditions, options);
        }
        return enabled;
    }
    async getABTestVariant(testName, options = {}) {
        const configs = await this.configModel
            .find({
            type: configuration_schema_1.ConfigurationType.AB_TEST,
            'abTest.testName': testName,
            isActive: true,
        })
            .exec();
        if (configs.length === 0) {
            return null;
        }
        const now = new Date();
        const activeConfigs = configs.filter(config => {
            const { startDate, endDate } = config.abTest;
            return now >= startDate && now <= endDate;
        });
        if (activeConfigs.length === 0) {
            return null;
        }
        const hash = this.hashUserId(options.userId || 'anonymous');
        const totalPercentage = activeConfigs.reduce((sum, config) => sum + config.abTest.percentage, 0);
        const userPercentage = hash % 100;
        let cumulativePercentage = 0;
        for (const config of activeConfigs) {
            cumulativePercentage += config.abTest.percentage;
            if (userPercentage < cumulativePercentage) {
                return config.abTest.variant;
            }
        }
        return null;
    }
    async deleteConfiguration(key, options = {}) {
        const query = this.buildQuery(key, options);
        const result = await this.configModel.findOneAndDelete(query).exec();
        if (!result) {
            throw new common_1.NotFoundException('Configuration not found');
        }
        this.invalidateCache(key, result.scope, result.environment, result.userId?.toString());
    }
    async bulkUpdateConfigurations(updates) {
        let updated = 0;
        const errors = [];
        for (const update of updates) {
            try {
                await this.updateConfiguration(update.key, { value: update.value }, update.options);
                updated++;
            }
            catch (error) {
                errors.push(`Failed to update ${update.key}: ${error.message}`);
            }
        }
        return { updated, errors };
    }
    async getConfigurationHistory(key, limit = 10) {
        return [];
    }
    buildQuery(key, options) {
        const query = { key };
        if (options.environment)
            query.environment = options.environment;
        if (options.userId)
            query.userId = options.userId;
        if (options.tenantId)
            query.tenantId = options.tenantId;
        if (!options.includeInactive)
            query.isActive = true;
        return query;
    }
    validateValue(value, dataType) {
        switch (dataType) {
            case configuration_schema_1.DataType.STRING:
                if (typeof value !== 'string') {
                    throw new common_1.BadRequestException('Value must be a string');
                }
                break;
            case configuration_schema_1.DataType.NUMBER:
                if (typeof value !== 'number') {
                    throw new common_1.BadRequestException('Value must be a number');
                }
                break;
            case configuration_schema_1.DataType.BOOLEAN:
                if (typeof value !== 'boolean') {
                    throw new common_1.BadRequestException('Value must be a boolean');
                }
                break;
            case configuration_schema_1.DataType.ARRAY:
                if (!Array.isArray(value)) {
                    throw new common_1.BadRequestException('Value must be an array');
                }
                break;
            case configuration_schema_1.DataType.JSON:
                if (typeof value !== 'object' || value === null) {
                    throw new common_1.BadRequestException('Value must be a valid JSON object');
                }
                break;
            case configuration_schema_1.DataType.DATE:
                if (!(value instanceof Date) && !Date.parse(value)) {
                    throw new common_1.BadRequestException('Value must be a valid date');
                }
                break;
        }
    }
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decrypt(encryptedText) {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    hashUserId(userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    evaluateConditions(conditions, options) {
        return true;
    }
    getCacheKey(key, options) {
        return `${key}:${options.environment || 'default'}:${options.userId || 'global'}:${options.tenantId || 'default'}`;
    }
    invalidateCache(key, scope, environment, userId) {
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
    async trackAccess(config) {
        setImmediate(async () => {
            try {
                await this.configModel
                    .updateOne({ _id: config._id }, {
                    $inc: { accessCount: 1 },
                    $set: { lastAccessedAt: new Date() },
                })
                    .exec();
            }
            catch (error) {
            }
        });
    }
    async loadCriticalConfigs() {
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
                }
                catch (error) {
                    console.error('Failed to decrypt critical config:', config.key);
                    return;
                }
            }
            this.configCache.set(cacheKey, value);
            this.cacheExpiry.set(cacheKey, Date.now() + 60 * 60 * 1000);
        });
    }
};
exports.ConfigurationService = ConfigurationService;
exports.ConfigurationService = ConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(configuration_schema_1.Configuration.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ConfigurationService);
//# sourceMappingURL=configuration.service.js.map