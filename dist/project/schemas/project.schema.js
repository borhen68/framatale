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
exports.ProjectSchema = exports.Project = exports.ProjectStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const product_size_schema_1 = require("../../common/schemas/product-size.schema");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["DRAFT"] = "DRAFT";
    ProjectStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["PUBLISHED"] = "PUBLISHED";
    ProjectStatus["ARCHIVED"] = "ARCHIVED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
let Project = class Project {
    title;
    description;
    type;
    userId;
    status;
    sizeCode;
    theme;
    pages;
    images;
    coverImage;
    totalPages;
    metadata;
    tags;
    isPublic;
    sharing;
};
exports.Project = Project;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project title' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Project.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: product_size_schema_1.ProductType, description: 'Type of product' }),
    (0, mongoose_1.Prop)({ required: true, enum: product_size_schema_1.ProductType }),
    __metadata("design:type", String)
], Project.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who owns this project' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ProjectStatus, description: 'Project status' }),
    (0, mongoose_1.Prop)({ required: true, enum: ProjectStatus, default: ProjectStatus.DRAFT }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product size code' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Project.prototype, "sizeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Theme configuration' }),
    (0, mongoose_1.Prop)({
        type: {
            name: String,
            primaryColor: String,
            secondaryColor: String,
            fontFamily: String,
            backgroundStyle: String,
        },
    }),
    __metadata("design:type", Object)
], Project.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of page layouts' }),
    (0, mongoose_1.Prop)({ type: [Object] }),
    __metadata("design:type", Array)
], Project.prototype, "pages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of image IDs used in project' }),
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Project.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project cover image URL' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Project.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Project.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            autoLayoutApplied: { type: Boolean, default: false },
            lastAutoLayoutAt: Date,
            exportedAt: Date,
            printReadyAt: Date,
        },
    }),
    __metadata("design:type", Object)
], Project.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project tags for organization' }),
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Project.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether project is shared publicly' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Project.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project sharing settings' }),
    (0, mongoose_1.Prop)({
        type: {
            shareToken: String,
            allowComments: { type: Boolean, default: false },
            allowDownload: { type: Boolean, default: false },
            expiresAt: Date,
        },
    }),
    __metadata("design:type", Object)
], Project.prototype, "sharing", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Project);
exports.ProjectSchema = mongoose_1.SchemaFactory.createForClass(Project);
//# sourceMappingURL=project.schema.js.map