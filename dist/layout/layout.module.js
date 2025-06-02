"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const layout_template_service_1 = require("./layout-template.service");
const layout_template_controller_1 = require("./layout-template.controller");
const page_layout_service_1 = require("./page-layout.service");
const page_layout_controller_1 = require("./page-layout.controller");
const layout_template_schema_1 = require("./schemas/layout-template.schema");
const metadata_module_1 = require("../metadata/metadata.module");
const project_module_1 = require("../project/project.module");
let LayoutModule = class LayoutModule {
};
exports.LayoutModule = LayoutModule;
exports.LayoutModule = LayoutModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: layout_template_schema_1.LayoutTemplate.name, schema: layout_template_schema_1.LayoutTemplateSchema }]),
            metadata_module_1.MetadataModule,
            project_module_1.ProjectModule,
        ],
        controllers: [layout_template_controller_1.LayoutTemplateController, page_layout_controller_1.PageLayoutController],
        providers: [layout_template_service_1.LayoutTemplateService, page_layout_service_1.PageLayoutService],
        exports: [layout_template_service_1.LayoutTemplateService, page_layout_service_1.PageLayoutService],
    })
], LayoutModule);
//# sourceMappingURL=layout.module.js.map