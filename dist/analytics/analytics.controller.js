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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const analytics_event_schema_1 = require("./schemas/analytics-event.schema");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackEvent(request) {
        return this.analyticsService.trackEvent(request);
    }
    async getMetrics(startDate, endDate, userId, eventType, category) {
        return this.analyticsService.getMetrics(new Date(startDate), new Date(endDate), { userId, eventType, category });
    }
    async getFunnelAnalysis(steps, startDate, endDate) {
        const funnelSteps = steps.split(',');
        return this.analyticsService.getFunnelAnalysis(funnelSteps, new Date(startDate), new Date(endDate));
    }
    async getCohortAnalysis(startDate, endDate) {
        return this.analyticsService.getCohortAnalysis(new Date(startDate), new Date(endDate));
    }
    async getRetentionAnalysis(days) {
        return this.analyticsService.getRetentionAnalysis(days);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('track'),
    (0, swagger_1.ApiOperation)({ summary: 'Track an analytics event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event tracked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackEvent", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics metrics (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string', description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string', description: 'End date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', type: 'string', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'eventType', enum: analytics_event_schema_1.EventType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', enum: analytics_event_schema_1.EventCategory, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('eventType')),
    __param(4, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('funnel'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get funnel analysis (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'steps', type: 'string', description: 'Comma-separated event types' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Funnel analysis retrieved successfully' }),
    __param(0, (0, common_1.Query)('steps')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFunnelAnalysis", null);
__decorate([
    (0, common_1.Get)('cohort'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get cohort analysis (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cohort analysis retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCohortAnalysis", null);
__decorate([
    (0, common_1.Get)('retention'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get retention analysis (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'days', type: 'number', required: false, description: 'Number of days to analyze' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Retention analysis retrieved successfully' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRetentionAnalysis", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map