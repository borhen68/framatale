"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const canvas_manager_service_1 = require("./canvas-manager.service");
const template_manager_service_1 = require("./template-manager.service");
const canvas_controller_1 = require("./canvas.controller");
const template_controller_1 = require("./template.controller");
const canvas_schema_1 = require("./schemas/canvas.schema");
const template_schema_1 = require("./schemas/template.schema");
let CanvasModule = class CanvasModule {
};
exports.CanvasModule = CanvasModule;
exports.CanvasModule = CanvasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: canvas_schema_1.Canvas.name, schema: canvas_schema_1.CanvasSchema },
                { name: template_schema_1.Template.name, schema: template_schema_1.TemplateSchema },
            ]),
        ],
        controllers: [canvas_controller_1.CanvasController, template_controller_1.TemplateController],
        providers: [canvas_manager_service_1.CanvasManagerService, template_manager_service_1.TemplateManagerService],
        exports: [canvas_manager_service_1.CanvasManagerService, template_manager_service_1.TemplateManagerService],
    })
], CanvasModule);
//# sourceMappingURL=canvas.module.js.map