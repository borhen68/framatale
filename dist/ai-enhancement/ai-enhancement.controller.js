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
exports.AIEnhancementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_enhancement_service_1 = require("./ai-enhancement.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AIEnhancementController = class AIEnhancementController {
    enhancementService;
    constructor(enhancementService) {
        this.enhancementService = enhancementService;
    }
    async createEnhancement(request, user) {
        return this.enhancementService.createEnhancementJob(request, user);
    }
    async getUserJobs(user) {
        return this.enhancementService.getUserJobs(user);
    }
    async getJobStatus(jobId, user) {
        return this.enhancementService.getJobStatus(jobId, user);
    }
    async cancelJob(jobId, user) {
        await this.enhancementService.cancelJob(jobId, user);
        return { message: 'Job cancelled successfully' };
    }
};
exports.AIEnhancementController = AIEnhancementController;
__decorate([
    (0, common_1.Post)('enhance'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an AI enhancement job' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Enhancement job created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIEnhancementController.prototype, "createEnhancement", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user enhancement jobs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Jobs retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIEnhancementController.prototype, "getUserJobs", null);
__decorate([
    (0, common_1.Get)('jobs/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enhancement job status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job not found' }),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIEnhancementController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Delete)('jobs/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel enhancement job' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job not found' }),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIEnhancementController.prototype, "cancelJob", null);
exports.AIEnhancementController = AIEnhancementController = __decorate([
    (0, swagger_1.ApiTags)('AI Enhancement'),
    (0, common_1.Controller)('ai-enhancement'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ai_enhancement_service_1.AIEnhancementService])
], AIEnhancementController);
//# sourceMappingURL=ai-enhancement.controller.js.map