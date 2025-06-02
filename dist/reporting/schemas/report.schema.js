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
exports.ReportSchema = exports.Report = exports.ReportFrequency = exports.ReportFormat = exports.ReportStatus = exports.ReportType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var ReportType;
(function (ReportType) {
    ReportType["SALES"] = "SALES";
    ReportType["USER_ENGAGEMENT"] = "USER_ENGAGEMENT";
    ReportType["PRODUCT_PERFORMANCE"] = "PRODUCT_PERFORMANCE";
    ReportType["FINANCIAL"] = "FINANCIAL";
    ReportType["OPERATIONAL"] = "OPERATIONAL";
    ReportType["CUSTOM"] = "CUSTOM";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["GENERATING"] = "GENERATING";
    ReportStatus["COMPLETED"] = "COMPLETED";
    ReportStatus["FAILED"] = "FAILED";
    ReportStatus["SCHEDULED"] = "SCHEDULED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "PDF";
    ReportFormat["CSV"] = "CSV";
    ReportFormat["EXCEL"] = "EXCEL";
    ReportFormat["JSON"] = "JSON";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
var ReportFrequency;
(function (ReportFrequency) {
    ReportFrequency["ONCE"] = "ONCE";
    ReportFrequency["DAILY"] = "DAILY";
    ReportFrequency["WEEKLY"] = "WEEKLY";
    ReportFrequency["MONTHLY"] = "MONTHLY";
    ReportFrequency["QUARTERLY"] = "QUARTERLY";
    ReportFrequency["YEARLY"] = "YEARLY";
})(ReportFrequency || (exports.ReportFrequency = ReportFrequency = {}));
let Report = class Report {
    name;
    description;
    type;
    status;
    format;
    createdBy;
    parameters;
    data;
    filePath;
    fileSize;
    downloadUrl;
    startedAt;
    completedAt;
    errorMessage;
    schedule;
    metadata;
    expiresAt;
    isShared;
    shareToken;
};
exports.Report = Report;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report name' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Report.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Report.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ReportType, description: 'Type of report' }),
    (0, mongoose_1.Prop)({ required: true, enum: ReportType }),
    __metadata("design:type", String)
], Report.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ReportStatus, description: 'Report generation status' }),
    (0, mongoose_1.Prop)({ required: true, enum: ReportStatus, default: ReportStatus.PENDING }),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ReportFormat, description: 'Output format' }),
    (0, mongoose_1.Prop)({ required: true, enum: ReportFormat }),
    __metadata("design:type", String)
], Report.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who created the report' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Report.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report parameters and filters' }),
    (0, mongoose_1.Prop)({
        type: {
            startDate: Date,
            endDate: Date,
            filters: Object,
            groupBy: [String],
            metrics: [String],
            dimensions: [String],
        },
    }),
    __metadata("design:type", Object)
], Report.prototype, "parameters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Generated report data' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Report.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report file path (if saved to disk)' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Report.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report file size in bytes' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Report.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Download URL' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Report.prototype, "downloadUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report generation start time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Report.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report generation completion time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Report.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if generation failed' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Report.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Scheduled report settings' }),
    (0, mongoose_1.Prop)({
        type: {
            frequency: { type: String, enum: ReportFrequency },
            nextRunAt: Date,
            lastRunAt: Date,
            isActive: { type: Boolean, default: true },
            recipients: [String],
        },
    }),
    __metadata("design:type", Object)
], Report.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            rowCount: Number,
            columnCount: Number,
            generationTime: Number,
            dataSource: String,
            version: String,
        },
    }),
    __metadata("design:type", Object)
], Report.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report expiration date' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Report.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether report is shared' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Report.prototype, "isShared", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Share token for public access' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Report.prototype, "shareToken", void 0);
exports.Report = Report = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Report);
exports.ReportSchema = mongoose_1.SchemaFactory.createForClass(Report);
//# sourceMappingURL=report.schema.js.map