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
exports.CanvasManagerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const canvas_schema_1 = require("./schemas/canvas.schema");
const template_schema_1 = require("./schemas/template.schema");
let CanvasManagerService = class CanvasManagerService {
    canvasModel;
    templateModel;
    constructor(canvasModel, templateModel) {
        this.canvasModel = canvasModel;
        this.templateModel = templateModel;
    }
    async createCanvas(request) {
        const lastCanvas = await this.canvasModel
            .findOne({ projectId: new mongoose_2.Types.ObjectId(request.projectId) })
            .sort({ order: -1 })
            .exec();
        const order = lastCanvas ? lastCanvas.order + 1 : 1;
        const canvas = new this.canvasModel({
            projectId: new mongoose_2.Types.ObjectId(request.projectId),
            productType: request.productType,
            canvasType: request.canvasType,
            name: request.name,
            order,
            dimensions: {
                width: request.dimensions.width,
                height: request.dimensions.height,
                unit: request.dimensions.unit || 'px',
                dpi: request.dimensions.dpi || 300,
                bleed: 3,
                safeZone: 5,
                orientation: request.dimensions.orientation || 'portrait',
            },
            background: {
                type: 'color',
                color: '#ffffff',
            },
            elements: [],
            metadata: {
                isTemplate: false,
                tags: [],
                version: 1,
                printReady: false,
            },
        });
        if (request.templateId) {
            await this.applyTemplate(canvas, request.templateId);
        }
        return canvas.save();
    }
    async createPhotoBook(projectId, dimensions, pageCount = 20, templateId) {
        const canvases = [];
        const frontCover = await this.createCanvas({
            projectId,
            productType: canvas_schema_1.ProductType.PHOTO_BOOK,
            canvasType: canvas_schema_1.CanvasType.COVER,
            name: 'Front Cover',
            dimensions,
            templateId: templateId ? `${templateId}_cover` : undefined,
        });
        canvases.push(frontCover);
        const spreadCount = Math.ceil(pageCount / 2);
        for (let i = 1; i <= spreadCount; i++) {
            const spread = await this.createCanvas({
                projectId,
                productType: canvas_schema_1.ProductType.PHOTO_BOOK,
                canvasType: canvas_schema_1.CanvasType.SPREAD,
                name: `Pages ${i * 2 - 1}-${i * 2}`,
                dimensions: {
                    width: dimensions.width * 2,
                    height: dimensions.height,
                },
                templateId: templateId ? `${templateId}_spread_${i}` : undefined,
            });
            canvases.push(spread);
        }
        const backCover = await this.createCanvas({
            projectId,
            productType: canvas_schema_1.ProductType.PHOTO_BOOK,
            canvasType: canvas_schema_1.CanvasType.COVER,
            name: 'Back Cover',
            dimensions,
            templateId: templateId ? `${templateId}_back` : undefined,
        });
        canvases.push(backCover);
        return canvases;
    }
    async createCalendar(projectId, dimensions, year, templateId) {
        const canvases = [];
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const cover = await this.createCanvas({
            projectId,
            productType: canvas_schema_1.ProductType.CALENDAR,
            canvasType: canvas_schema_1.CanvasType.COVER,
            name: `${year} Calendar Cover`,
            dimensions,
            templateId: templateId ? `${templateId}_cover` : undefined,
        });
        canvases.push(cover);
        for (let i = 0; i < 12; i++) {
            const monthCanvas = await this.createCanvas({
                projectId,
                productType: canvas_schema_1.ProductType.CALENDAR,
                canvasType: canvas_schema_1.CanvasType.MONTH,
                name: `${months[i]} ${year}`,
                dimensions,
                templateId: templateId ? `${templateId}_month` : undefined,
            });
            await this.addCalendarGrid(monthCanvas._id.toString(), year, i + 1);
            canvases.push(monthCanvas);
        }
        return canvases;
    }
    async addExtraCanvas(projectId, insertAfter, canvasType = canvas_schema_1.CanvasType.PAGE) {
        const existingCanvases = await this.canvasModel
            .find({ projectId: new mongoose_2.Types.ObjectId(projectId) })
            .sort({ order: 1 })
            .exec();
        if (existingCanvases.length === 0) {
            throw new common_1.NotFoundException('No existing canvases found for project');
        }
        const referenceCanvas = existingCanvases[0];
        await this.canvasModel
            .updateMany({
            projectId: new mongoose_2.Types.ObjectId(projectId),
            order: { $gt: insertAfter }
        }, { $inc: { order: 1 } })
            .exec();
        const newCanvas = await this.createCanvas({
            projectId,
            productType: referenceCanvas.productType,
            canvasType,
            name: `Page ${insertAfter + 1}`,
            dimensions: {
                width: referenceCanvas.dimensions.width,
                height: referenceCanvas.dimensions.height,
                unit: referenceCanvas.dimensions.unit,
                dpi: referenceCanvas.dimensions.dpi,
                orientation: referenceCanvas.dimensions.orientation,
            },
        });
        const canvasDoc = await this.canvasModel.findById(newCanvas._id).exec();
        if (canvasDoc) {
            canvasDoc.order = insertAfter + 1;
            await canvasDoc.save();
            return canvasDoc;
        }
        return newCanvas;
    }
    async applyTemplate(canvas, templateId) {
        const template = await this.templateModel.findById(templateId).exec();
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const templateCanvas = template.canvases.find(tc => tc.canvasType === canvas.canvasType ||
            (template.canvases.length === 1 && template.canvases[0]));
        if (!templateCanvas) {
            throw new common_1.BadRequestException('Template does not have matching canvas type');
        }
        if (templateCanvas.background) {
            canvas.background = templateCanvas.background;
        }
        canvas.elements = templateCanvas.elements.map(element => ({
            ...element,
            id: `element_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            type: element.type,
        }));
        canvas.template = {
            templateId: template._id,
            templateName: template.name,
            templateCategory: template.category,
            appliedAt: new Date(),
            customizations: [],
        };
    }
    async addElement(request) {
        const canvas = await this.canvasModel.findById(request.canvasId).exec();
        if (!canvas) {
            throw new common_1.NotFoundException('Canvas not found');
        }
        const elementId = `element_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const newElement = {
            id: elementId,
            type: request.element.type,
            name: request.element.name,
            position: {
                x: request.element.position.x,
                y: request.element.position.y,
                z: canvas.elements.length
            },
            size: request.element.size,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
        };
        switch (request.element.type) {
            case canvas_schema_1.ElementType.IMAGE:
                if (request.element.image) {
                    newElement['image'] = {
                        url: request.element.image.url,
                        originalUrl: request.element.image.url,
                        filters: {
                            brightness: 100,
                            contrast: 100,
                            saturation: 100,
                            blur: 0,
                            sepia: 0,
                        },
                    };
                }
                break;
            case canvas_schema_1.ElementType.TEXT:
                newElement['text'] = {
                    content: request.element.text?.content || 'Sample Text',
                    fontFamily: 'Arial',
                    fontSize: request.element.text?.fontSize || 16,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    color: request.element.text?.color || '#000000',
                    align: 'left',
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    textDecoration: 'none',
                };
                break;
            case canvas_schema_1.ElementType.SHAPE:
                newElement['shape'] = {
                    type: request.element.shape?.type || 'rectangle',
                    fill: request.element.shape?.fill || '#000000',
                    stroke: {
                        color: '#000000',
                        width: 0,
                        style: 'solid',
                    },
                    cornerRadius: 0,
                };
                break;
        }
        canvas.elements.push(newElement);
        canvas.metadata.version += 1;
        return canvas.save();
    }
    async getProjectCanvases(projectId) {
        return this.canvasModel
            .find({ projectId: new mongoose_2.Types.ObjectId(projectId) })
            .sort({ order: 1 })
            .exec();
    }
    async updateElement(canvasId, elementId, updates) {
        const canvas = await this.canvasModel.findById(canvasId).exec();
        if (!canvas) {
            throw new common_1.NotFoundException('Canvas not found');
        }
        const elementIndex = canvas.elements.findIndex(e => e.id === elementId);
        if (elementIndex === -1) {
            throw new common_1.NotFoundException('Element not found');
        }
        Object.assign(canvas.elements[elementIndex], updates);
        canvas.metadata.version += 1;
        if (canvas.template) {
            const customization = `element_${elementId}_updated`;
            if (!canvas.template.customizations.includes(customization)) {
                canvas.template.customizations.push(customization);
            }
        }
        return canvas.save();
    }
    async deleteElement(canvasId, elementId) {
        const canvas = await this.canvasModel.findById(canvasId).exec();
        if (!canvas) {
            throw new common_1.NotFoundException('Canvas not found');
        }
        canvas.elements = canvas.elements.filter(e => e.id !== elementId);
        canvas.metadata.version += 1;
        return canvas.save();
    }
    async addCalendarGrid(canvasId, _year, month) {
        const canvas = await this.canvasModel.findById(canvasId).exec();
        if (!canvas)
            return;
        const gridElement = {
            id: `calendar_grid_${month}`,
            type: canvas_schema_1.ElementType.SHAPE,
            name: 'Calendar Grid',
            position: { x: 50, y: 200, z: 0 },
            size: { width: canvas.dimensions.width - 100, height: 300 },
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            shape: {
                type: 'rectangle',
                fill: 'transparent',
                stroke: {
                    color: '#cccccc',
                    width: 1,
                    style: 'solid',
                },
                cornerRadius: 0,
            },
        };
        canvas.elements.push(gridElement);
        await canvas.save();
    }
};
exports.CanvasManagerService = CanvasManagerService;
exports.CanvasManagerService = CanvasManagerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(canvas_schema_1.Canvas.name)),
    __param(1, (0, mongoose_1.InjectModel)(template_schema_1.Template.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CanvasManagerService);
//# sourceMappingURL=canvas-manager.service.js.map