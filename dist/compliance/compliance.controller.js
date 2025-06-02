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
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const compliance_service_1 = require("./compliance.service");
const compliance_record_schema_1 = require("./schemas/compliance-record.schema");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let ComplianceController = class ComplianceController {
    complianceService;
    constructor(complianceService) {
        this.complianceService = complianceService;
    }
    async recordConsent(request) {
        return this.complianceService.recordConsent(request);
    }
    async withdrawConsent(consentType, user) {
        return this.complianceService.withdrawConsent(user._id.toString(), consentType);
    }
    async submitDataRequest(request) {
        return this.complianceService.handleDataRequest(request);
    }
    async getUserComplianceData(userId) {
        return this.complianceService.getUserComplianceData(userId);
    }
    async getMyComplianceData(user) {
        return this.complianceService.getUserComplianceData(user._id.toString());
    }
    async scheduleDataRetention(request) {
        return this.complianceService.scheduleDataRetention(request.userId, request.retentionPeriod, request.retentionUnit, request.reason);
    }
    async getComplianceReport(startDate, endDate) {
        return this.complianceService.getComplianceReport(new Date(startDate), new Date(endDate));
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Post)('consent'),
    (0, swagger_1.ApiOperation)({ summary: 'Record user consent' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Consent recorded successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.Post)('consent/withdraw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw user consent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consent withdrawn successfully' }),
    __param(0, (0, common_1.Body)('consentType')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "withdrawConsent", null);
__decorate([
    (0, common_1.Post)('data-request'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit data request (GDPR/CCPA)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Data request submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "submitDataRequest", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user compliance data (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance data retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getUserComplianceData", null);
__decorate([
    (0, common_1.Get)('my-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user compliance data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance data retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getMyComplianceData", null);
__decorate([
    (0, common_1.Post)('retention/schedule'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule data retention (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Data retention scheduled successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "scheduleDataRetention", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance report (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string', description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string', description: 'End date (ISO string)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance report retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getComplianceReport", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, swagger_1.ApiTags)('Compliance'),
    (0, common_1.Controller)('compliance'),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map