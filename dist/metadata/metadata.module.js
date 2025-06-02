"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const metadata_service_1 = require("./metadata.service");
const metadata_controller_1 = require("./metadata.controller");
const image_metadata_schema_1 = require("./schemas/image-metadata.schema");
const image_analyzer_module_1 = require("../image-analyzer/image-analyzer.module");
let MetadataModule = class MetadataModule {
};
exports.MetadataModule = MetadataModule;
exports.MetadataModule = MetadataModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: image_metadata_schema_1.ImageMetadata.name, schema: image_metadata_schema_1.ImageMetadataSchema }]),
            image_analyzer_module_1.ImageAnalyzerModule,
        ],
        controllers: [metadata_controller_1.MetadataController],
        providers: [metadata_service_1.MetadataService],
        exports: [metadata_service_1.MetadataService],
    })
], MetadataModule);
//# sourceMappingURL=metadata.module.js.map