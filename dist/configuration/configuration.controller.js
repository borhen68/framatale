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
exports.ConfigurationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const configuration_service_1 = require("./configuration.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let ConfigurationController = class ConfigurationController {
    configurationService;
    constructor(configurationService) {
        this.configurationService = configurationService;
    }
    async createConfiguration(request) {
        return this.configurationService.createConfiguration(request);
    }
    async getAllConfigurations(environment, includeInactive) {
        return this.configurationService.getAllConfigurations({
            environment,
            includeInactive,
        });
    }
    async getConfigurationsByCategory(category, environment) {
        return this.configurationService.getConfigurationsByCategory(category, { environment });
    }
    async isFeatureEnabled(featureName, environment, user) {
        const enabled = await this.configurationService.isFeatureEnabled(featureName, {
            environment,
            userId: user ? user._id.toString() : undefined,
        });
        return { enabled };
    }
    async getABTestVariant(testName, environment, user) {
        const variant = await this.configurationService.getABTestVariant(testName, {
            environment,
            userId: user ? user._id.toString() : undefined,
        });
        return { variant };
    }
    async getUserConfigurations(environment, user) {
        return this.configurationService.getAllConfigurations({
            environment,
            userId: user ? user._id.toString() : undefined,
        });
    }
    async getConfiguration(key, environment, defaultValue, user) {
        const options = {
            environment,
            userId: user ? user._id.toString() : undefined,
        };
        const value = defaultValue !== undefined
            ? await this.configurationService.getConfigurationWithDefault(key, defaultValue, options)
            : await this.configurationService.getConfiguration(key, options);
        return { value };
    }
    async updateConfiguration(key, updates, environment) {
        return this.configurationService.updateConfiguration(key, updates, { environment });
    }
    async deleteConfiguration(key, environment) {
        await this.configurationService.deleteConfiguration(key, { environment });
        return { message: 'Configuration deleted successfully' };
    }
    async bulkUpdateConfigurations(updates) {
        return this.configurationService.bulkUpdateConfigurations(updates);
    }
};
exports.ConfigurationController = ConfigurationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new configuration (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Configuration created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "createConfiguration", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all configurations (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'includeInactive', type: 'boolean', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurations retrieved successfully' }),
    __param(0, (0, common_1.Query)('environment')),
    __param(1, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getAllConfigurations", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get configurations by category (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurations retrieved successfully' }),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Query)('environment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getConfigurationsByCategory", null);
__decorate([
    (0, common_1.Get)('feature/:featureName'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if feature is enabled' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feature status retrieved successfully' }),
    __param(0, (0, common_1.Param)('featureName')),
    __param(1, (0, common_1.Query)('environment')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "isFeatureEnabled", null);
__decorate([
    (0, common_1.Get)('ab-test/:testName'),
    (0, swagger_1.ApiOperation)({ summary: 'Get A/B test variant' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test variant retrieved successfully' }),
    __param(0, (0, common_1.Param)('testName')),
    __param(1, (0, common_1.Query)('environment')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getABTestVariant", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user-specific configurations' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User configurations retrieved successfully' }),
    __param(0, (0, common_1.Query)('environment')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getUserConfigurations", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Get configuration by key' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'default', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration retrieved successfully' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('environment')),
    __param(2, (0, common_1.Query)('default')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getConfiguration", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update configuration (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration updated successfully' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('environment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "updateConfiguration", null);
__decorate([
    (0, common_1.Delete)(':key'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete configuration (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'environment', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration deleted successfully' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('environment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "deleteConfiguration", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update configurations (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurations updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "bulkUpdateConfigurations", null);
exports.ConfigurationController = ConfigurationController = __decorate([
    (0, swagger_1.ApiTags)('Configuration'),
    (0, common_1.Controller)('configuration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [configuration_service_1.ConfigurationService])
], ConfigurationController);
//# sourceMappingURL=configuration.controller.js.map