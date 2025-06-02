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
exports.EnhancementJobSchema = exports.EnhancementJob = exports.JobStatus = exports.EnhancementType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var EnhancementType;
(function (EnhancementType) {
    EnhancementType["UPSCALE"] = "UPSCALE";
    EnhancementType["BACKGROUND_REMOVAL"] = "BACKGROUND_REMOVAL";
    EnhancementType["NOISE_REDUCTION"] = "NOISE_REDUCTION";
    EnhancementType["COLOR_CORRECTION"] = "COLOR_CORRECTION";
    EnhancementType["SHARPENING"] = "SHARPENING";
    EnhancementType["STYLE_TRANSFER"] = "STYLE_TRANSFER";
})(EnhancementType || (exports.EnhancementType = EnhancementType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "PENDING";
    JobStatus["PROCESSING"] = "PROCESSING";
    JobStatus["COMPLETED"] = "COMPLETED";
    JobStatus["FAILED"] = "FAILED";
    JobStatus["CANCELLED"] = "CANCELLED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
let EnhancementJob = class EnhancementJob {
    originalMediaId;
    enhancedMediaId;
    userId;
    enhancementType;
    status;
    parameters;
    progress;
    errorMessage;
    startedAt;
    completedAt;
    estimatedDuration;
    externalJobId;
    metadata;
};
exports.EnhancementJob = EnhancementJob;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to original media file' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Media' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnhancementJob.prototype, "originalMediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to enhanced media file' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Media' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnhancementJob.prototype, "enhancedMediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who requested the enhancement' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnhancementJob.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EnhancementType, description: 'Type of enhancement' }),
    (0, mongoose_1.Prop)({ required: true, enum: EnhancementType }),
    __metadata("design:type", String)
], EnhancementJob.prototype, "enhancementType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: JobStatus, description: 'Job status' }),
    (0, mongoose_1.Prop)({ required: true, enum: JobStatus, default: JobStatus.PENDING }),
    __metadata("design:type", String)
], EnhancementJob.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enhancement parameters' }),
    (0, mongoose_1.Prop)({
        type: {
            scale: Number,
            quality: Number,
            preserveTransparency: Boolean,
            styleReference: String,
            customSettings: Object,
        },
    }),
    __metadata("design:type", Object)
], EnhancementJob.prototype, "parameters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing progress (0-100)' }),
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], EnhancementJob.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if job failed' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnhancementJob.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing start time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EnhancementJob.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing completion time' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EnhancementJob.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated processing time in seconds' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EnhancementJob.prototype, "estimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'External service job ID' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnhancementJob.prototype, "externalJobId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            originalSize: Number,
            enhancedSize: Number,
            processingTime: Number,
            serviceUsed: String,
            qualityScore: Number,
        },
    }),
    __metadata("design:type", Object)
], EnhancementJob.prototype, "metadata", void 0);
exports.EnhancementJob = EnhancementJob = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], EnhancementJob);
exports.EnhancementJobSchema = mongoose_1.SchemaFactory.createForClass(EnhancementJob);
//# sourceMappingURL=enhancement-job.schema.js.map