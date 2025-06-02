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
exports.CanvasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const canvas_manager_service_1 = require("./canvas-manager.service");
const canvas_schema_1 = require("./schemas/canvas.schema");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let CanvasController = class CanvasController {
    canvasManager;
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }
    async createCanvas(request) {
        return this.canvasManager.createCanvas(request);
    }
    async createPhotoBook(request) {
        return this.canvasManager.createPhotoBook(request.projectId, request.dimensions, request.pageCount || 20, request.templateId);
    }
    async createCalendar(request) {
        return this.canvasManager.createCalendar(request.projectId, request.dimensions, request.year, request.templateId);
    }
    async addExtraCanvas(request) {
        return this.canvasManager.addExtraCanvas(request.projectId, request.insertAfter, request.canvasType);
    }
    async getProjectCanvases(projectId) {
        return this.canvasManager.getProjectCanvases(projectId);
    }
    async addElement(canvasId, element) {
        return this.canvasManager.addElement({ canvasId, element });
    }
    async updateElement(canvasId, elementId, updates) {
        return this.canvasManager.updateElement(canvasId, elementId, updates);
    }
    async deleteElement(canvasId, elementId) {
        return this.canvasManager.deleteElement(canvasId, elementId);
    }
    async create8x8PhotoBook(request) {
        const dimensions = { width: 2400, height: 2400 };
        const canvases = await this.canvasManager.createPhotoBook(request.projectId, dimensions, 20, request.templateId);
        return {
            message: '8x8 photo book created successfully',
            canvases,
            details: {
                productType: 'PHOTO_BOOK',
                size: '8x8',
                pageCount: 20,
                canvasCount: canvases.length,
                dimensions: {
                    cover: dimensions,
                    spread: { width: 4800, height: 2400 },
                    dpi: 300,
                    unit: 'px',
                },
            },
        };
    }
    async addFiveExtraPages(request) {
        const addedCanvases = [];
        for (let i = 1; i <= 5; i++) {
            const canvas = await this.canvasManager.addExtraCanvas(request.projectId, 20 + i - 1, canvas_schema_1.CanvasType.SPREAD);
            addedCanvases.push(canvas);
        }
        return {
            message: '5 extra pages added successfully',
            addedCanvases,
            pricingUpdate: {
                extraPages: 5,
                costPerPage: 1.00,
                totalExtraCost: 5.00,
                newTotalPrice: 27.00,
            },
        };
    }
    async getSizeGuide() {
        return {
            photoBooks: {
                '8x8': {
                    cover: { width: 2400, height: 2400 },
                    spread: { width: 4800, height: 2400 },
                    dpi: 300,
                    unit: 'px',
                },
                '12x12': {
                    cover: { width: 3600, height: 3600 },
                    spread: { width: 7200, height: 3600 },
                    dpi: 300,
                    unit: 'px',
                },
                '8x11': {
                    cover: { width: 2400, height: 3300 },
                    spread: { width: 4800, height: 3300 },
                    dpi: 300,
                    unit: 'px',
                },
            },
            calendars: {
                '11x8.5': {
                    dimensions: { width: 3300, height: 2550 },
                    orientation: 'landscape',
                    dpi: 300,
                },
                '12x12': {
                    dimensions: { width: 3600, height: 3600 },
                    orientation: 'portrait',
                    dpi: 300,
                },
            },
            cards: {
                '5x7': {
                    dimensions: { width: 1500, height: 2100 },
                    orientation: 'portrait',
                    dpi: 300,
                },
                '4x6': {
                    dimensions: { width: 1200, height: 1800 },
                    orientation: 'portrait',
                    dpi: 300,
                },
            },
            examples: [
                'All dimensions are in pixels at 300 DPI for print quality',
                'Photo book spreads are double-width for two-page layouts',
                'Bleed zones (3mm) and safe zones (5mm) are automatically added',
                'Templates are size-specific and will only show for matching dimensions',
            ],
        };
    }
};
exports.CanvasController = CanvasController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new canvas' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Canvas created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "createCanvas", null);
__decorate([
    (0, common_1.Post)('photo-book'),
    (0, swagger_1.ApiOperation)({ summary: 'Create photo book with multiple canvases' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Photo book canvases created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "createPhotoBook", null);
__decorate([
    (0, common_1.Post)('calendar'),
    (0, swagger_1.ApiOperation)({ summary: 'Create calendar with 12 month canvases' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Calendar canvases created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "createCalendar", null);
__decorate([
    (0, common_1.Post)('add-extra'),
    (0, swagger_1.ApiOperation)({ summary: 'Add extra canvas/page to project' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Extra canvas added successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "addExtraCanvas", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all canvases for a project' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project canvases retrieved successfully' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "getProjectCanvases", null);
__decorate([
    (0, common_1.Post)(':canvasId/elements'),
    (0, swagger_1.ApiOperation)({ summary: 'Add element to canvas' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Element added successfully' }),
    __param(0, (0, common_1.Param)('canvasId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "addElement", null);
__decorate([
    (0, common_1.Put)(':canvasId/elements/:elementId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update canvas element' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Element updated successfully' }),
    __param(0, (0, common_1.Param)('canvasId')),
    __param(1, (0, common_1.Param)('elementId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "updateElement", null);
__decorate([
    (0, common_1.Delete)(':canvasId/elements/:elementId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete canvas element' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Element deleted successfully' }),
    __param(0, (0, common_1.Param)('canvasId')),
    __param(1, (0, common_1.Param)('elementId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "deleteElement", null);
__decorate([
    (0, common_1.Post)('examples/8x8-photo-book'),
    (0, swagger_1.ApiOperation)({ summary: 'Example: Create 8x8 photo book' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '8x8 photo book created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "create8x8PhotoBook", null);
__decorate([
    (0, common_1.Post)('examples/add-5-pages'),
    (0, swagger_1.ApiOperation)({ summary: 'Example: Add 5 extra pages to photo book' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Extra pages added successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "addFiveExtraPages", null);
__decorate([
    (0, common_1.Get)('examples/size-guide'),
    (0, swagger_1.ApiOperation)({ summary: 'Get canvas size guide for different products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Size guide retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "getSizeGuide", null);
exports.CanvasController = CanvasController = __decorate([
    (0, swagger_1.ApiTags)('Canvas Management'),
    (0, common_1.Controller)('canvas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [canvas_manager_service_1.CanvasManagerService])
], CanvasController);
//# sourceMappingURL=canvas.controller.js.map