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
exports.LocalizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const localization_service_1 = require("./localization.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let LocalizationController = class LocalizationController {
    localizationService;
    constructor(localizationService) {
        this.localizationService = localizationService;
    }
    async createTranslation(request) {
        return this.localizationService.createTranslation(request);
    }
    async translate(key, language, namespace, count) {
        const options = {
            language,
            namespace,
            count: count ? parseInt(count.toString()) : undefined,
        };
        const translation = await this.localizationService.translate(key, options);
        return { translation };
    }
    async getTranslations(language, namespace) {
        return this.localizationService.getTranslations(language, namespace);
    }
    async getSupportedLanguages() {
        const languages = await this.localizationService.getSupportedLanguages();
        return { languages };
    }
    async getNamespaces() {
        const namespaces = await this.localizationService.getNamespaces();
        return { namespaces };
    }
    async getTranslationStats() {
        return this.localizationService.getTranslationStats();
    }
    async getMissingTranslations(targetLanguage, sourceLanguage) {
        const missing = await this.localizationService.getMissingTranslations(targetLanguage, sourceLanguage);
        return { missing };
    }
    async bulkImportTranslations(language, namespace, translations) {
        return this.localizationService.bulkImportTranslations(language, namespace, translations);
    }
    async exportTranslations(language, namespace) {
        return this.localizationService.exportTranslations(language, namespace);
    }
};
exports.LocalizationController = LocalizationController;
__decorate([
    (0, common_1.Post)('translations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new translation (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Translation created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "createTranslation", null);
__decorate([
    (0, common_1.Get)('translate/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Get translation for a key' }),
    (0, swagger_1.ApiQuery)({ name: 'language', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'namespace', type: 'string', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'count', type: 'number', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Translation retrieved successfully' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('language')),
    __param(2, (0, common_1.Query)('namespace')),
    __param(3, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "translate", null);
__decorate([
    (0, common_1.Get)('translations/:language'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all translations for a language' }),
    (0, swagger_1.ApiQuery)({ name: 'namespace', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Translations retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Query)('namespace')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "getTranslations", null);
__decorate([
    (0, common_1.Get)('languages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supported languages' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supported languages retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "getSupportedLanguages", null);
__decorate([
    (0, common_1.Get)('namespaces'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available namespaces' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Namespaces retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "getNamespaces", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get translation statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "getTranslationStats", null);
__decorate([
    (0, common_1.Get)('missing/:targetLanguage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get missing translations (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'sourceLanguage', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Missing translations retrieved successfully' }),
    __param(0, (0, common_1.Param)('targetLanguage')),
    __param(1, (0, common_1.Query)('sourceLanguage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "getMissingTranslations", null);
__decorate([
    (0, common_1.Post)('import/:language/:namespace'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk import translations (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Translations imported successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('namespace')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "bulkImportTranslations", null);
__decorate([
    (0, common_1.Get)('export/:language'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Export translations (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'namespace', type: 'string', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Translations exported successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Query)('namespace')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalizationController.prototype, "exportTranslations", null);
exports.LocalizationController = LocalizationController = __decorate([
    (0, swagger_1.ApiTags)('Localization'),
    (0, common_1.Controller)('localization'),
    __metadata("design:paramtypes", [localization_service_1.LocalizationService])
], LocalizationController);
//# sourceMappingURL=localization.controller.js.map