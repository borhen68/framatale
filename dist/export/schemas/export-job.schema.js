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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportJobSchema = exports.ExportJob = exports.ExportStatus = exports.ExportFormat = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["PDF_PRINT"] = "PDF_PRINT";
    ExportFormat["PDF_WEB"] = "PDF_WEB";
    ExportFormat["JPEG_HIGH"] = "JPEG_HIGH";
    ExportFormat["JPEG_WEB"] = "JPEG_WEB";
    ExportFormat["PNG"] = "PNG";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
var ExportStatus;
(function (ExportStatus) {
    ExportStatus["PENDING"] = "PENDING";
    ExportStatus["PROCESSING"] = "PROCESSING";
    ExportStatus["COMPLETED"] = "COMPLETED";
    ExportStatus["FAILED"] = "FAILED";
    ExportStatus["CANCELLED"] = "CANCELLED";
})(ExportStatus || (exports.ExportStatus = ExportStatus = {}));
let ExportJob = class ExportJob {
    projectId;
    userId;
    format;
    status;
    settings;
    progress;
    filePath;
    fileSize;
    downloadUrl;
    errorMessage;
    startedAt;
    completedAt;
    expiresAt;
    pageCount;
    metadata;
};
exports.ExportJob = ExportJob;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to project' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Project' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExportJob.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who requested the export' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExportJob.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ExportFormat, description: 'Export format' }),
    (0, mongoose_1.Prop)({ required: true, enum: ExportFormat }),
    __metadata("design:type", String)
], ExportJob.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ExportStatus, description: 'Export status' }),
    (0, mongoose_1.Prop)({ required: true, enum: ExportStatus, default: ExportStatus.PENDING }),
    __metadata("design:type", String)
], ExportJob.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Export settings' }),
    (0, mongoose_1.Prop)({
        type: {
            dpi: Number,
            quality: Number,
            colorProfile: String,
            bleed: Boolean,
            cropMarks: Boolean,
            includeMetadata: Boolean,
            pageRange: String,
        },
    }),
    __metadata("design:type", Object)
], ExportJob.prototype, "settings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Export progress (0-100)' }),
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], ExportJob.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Generated file path' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ExportJob.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ExportJob.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Download URL' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ExportJob.prototype, "downloadUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if export failed' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ExportJob.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing start time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ExportJob.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing completion time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ExportJob.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File expiration time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ExportJob.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of pages exported' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ExportJob.prototype, "pageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Export metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            processingTime: Number,
            totalImages: Number,
            resolution: String,
            colorSpace: String,
            compression: String,
        },
    }),
    __metadata("design:type", Object)
], ExportJob.prototype, "metadata", void 0);
exports.ExportJob = ExportJob = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExportJob);
exports.ExportJobSchema = mongoose_1.SchemaFactory.createForClass(ExportJob);
//# sourceMappingURL=export-job.schema.js.map