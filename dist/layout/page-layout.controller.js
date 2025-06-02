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
exports.PageLayoutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const page_layout_service_1 = require("./page-layout.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let PageLayoutController = class PageLayoutController {
    pageLayoutService;
    constructor(pageLayoutService) {
        this.pageLayoutService = pageLayoutService;
    }
    async generateAutoLayout(options, user) {
        return this.pageLayoutService.generateAutoLayout(options);
    }
    async applyLayout(request, user) {
        await this.pageLayoutService.applyLayoutToProject(request.projectId, request.templateId, request.imageIds, user._id.toString());
        return { message: 'Layout applied successfully' };
    }
};
exports.PageLayoutController = PageLayoutController;
__decorate([
    (0, common_1.Post)('auto-generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate automatic layout suggestions' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Layout suggestions generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PageLayoutController.prototype, "generateAutoLayout", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply layout to project' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Layout applied successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PageLayoutController.prototype, "applyLayout", null);
exports.PageLayoutController = PageLayoutController = __decorate([
    (0, swagger_1.ApiTags)('Page Layout'),
    (0, common_1.Controller)('page-layout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [page_layout_service_1.PageLayoutService])
], PageLayoutController);
//# sourceMappingURL=page-layout.controller.js.map