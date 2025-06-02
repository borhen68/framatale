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
exports.PricingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pricing_engine_service_1 = require("./pricing-engine.service");
const pricing_rule_service_1 = require("./pricing-rule.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let PricingController = class PricingController {
    pricingEngine;
    pricingRuleService;
    constructor(pricingEngine, pricingRuleService) {
        this.pricingEngine = pricingEngine;
        this.pricingRuleService = pricingRuleService;
    }
    async calculatePrice(request, user) {
        const enrichedRequest = {
            ...request,
            userId: user._id.toString(),
            userSegment: user.role === user_schema_1.UserRole.ADMIN ? 'admin' : 'customer',
            timestamp: new Date(),
        };
        return this.pricingEngine.calculatePrice(enrichedRequest);
    }
    async generateQuote(request, user) {
        const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const items = [];
        let totals = {
            subtotal: 0,
            totalDiscounts: 0,
            totalTaxes: 0,
            totalShipping: 0,
            grandTotal: 0,
        };
        for (const item of request.items) {
            const pricingRequest = {
                productType: item.productType,
                quantity: item.quantity,
                userId: user._id.toString(),
                userSegment: user.role === user_schema_1.UserRole.ADMIN ? 'admin' : 'customer',
                region: request.shippingAddress?.country || 'US',
                timestamp: new Date(),
            };
            const pricing = await this.pricingEngine.calculatePrice(pricingRequest);
            items.push({
                ...pricing,
                productType: item.productType,
                quantity: item.quantity,
            });
            totals.subtotal += pricing.breakdown.subtotal;
            totals.totalDiscounts += pricing.breakdown.totalDiscounts;
            totals.totalTaxes += pricing.breakdown.totalTaxes;
            totals.totalShipping += pricing.breakdown.totalShipping;
            totals.grandTotal += pricing.breakdown.grandTotal;
        }
        return {
            items,
            totals,
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            quoteId,
        };
    }
    async getPricingRules(type, scope, isActive) {
        return this.pricingRuleService.getRules({ type, scope, isActive });
    }
    async createPricingRule(ruleData, user) {
        return this.pricingRuleService.createRule({
            ...ruleData,
            metadata: {
                createdBy: user._id.toString(),
                approvedBy: undefined,
                version: 1,
                tags: ruleData.metadata?.tags || [],
                businessReason: ruleData.metadata?.businessReason || '',
                ...ruleData.metadata,
            },
        });
    }
    async updatePricingRule(ruleId, updates, user) {
        return this.pricingRuleService.updateRule(ruleId, {
            ...updates,
            metadata: {
                createdBy: updates.metadata?.createdBy || '',
                approvedBy: updates.metadata?.approvedBy,
                version: (updates.metadata?.version || 0) + 1,
                tags: updates.metadata?.tags || [],
                businessReason: updates.metadata?.businessReason || '',
                ...updates.metadata,
            },
        });
    }
    async deletePricingRule(ruleId) {
        await this.pricingRuleService.deleteRule(ruleId);
        return { message: 'Pricing rule deleted successfully' };
    }
    async testPricingRule(ruleId, testRequest) {
        return this.pricingRuleService.testRule(ruleId, testRequest);
    }
    async getPricingAnalytics(startDate, endDate) {
        return this.pricingRuleService.getAnalytics(new Date(startDate), new Date(endDate));
    }
    async getPricingOptimization(request) {
        return this.pricingRuleService.getOptimizationRecommendations(request);
    }
};
exports.PricingController = PricingController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate price for a product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price calculated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "calculatePrice", null);
__decorate([
    (0, common_1.Post)('quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a detailed price quote' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quote generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "generateQuote", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pricing rules (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'scope', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pricing rules retrieved successfully' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('scope')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getPricingRules", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create pricing rule (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pricing rule created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "createPricingRule", null);
__decorate([
    (0, common_1.Put)('rules/:ruleId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update pricing rule (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pricing rule updated successfully' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "updatePricingRule", null);
__decorate([
    (0, common_1.Delete)('rules/:ruleId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete pricing rule (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pricing rule deleted successfully' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "deletePricingRule", null);
__decorate([
    (0, common_1.Post)('rules/:ruleId/test'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Test pricing rule (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pricing rule tested successfully' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "testPricingRule", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get pricing analytics (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pricing analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getPricingAnalytics", null);
__decorate([
    (0, common_1.Post)('optimize'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get pricing optimization recommendations (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Optimization recommendations generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getPricingOptimization", null);
exports.PricingController = PricingController = __decorate([
    (0, swagger_1.ApiTags)('Pricing'),
    (0, common_1.Controller)('pricing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [pricing_engine_service_1.PricingEngineService,
        pricing_rule_service_1.PricingRuleService])
], PricingController);
//# sourceMappingURL=pricing.controller.js.map