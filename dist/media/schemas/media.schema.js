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
exports.MediaSchema = exports.Media = exports.MediaStatus = exports.MediaType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "IMAGE";
    MediaType["VIDEO"] = "VIDEO";
    MediaType["DOCUMENT"] = "DOCUMENT";
})(MediaType || (exports.MediaType = MediaType = {}));
var MediaStatus;
(function (MediaStatus) {
    MediaStatus["UPLOADING"] = "UPLOADING";
    MediaStatus["PROCESSING"] = "PROCESSING";
    MediaStatus["READY"] = "READY";
    MediaStatus["ERROR"] = "ERROR";
})(MediaStatus || (exports.MediaStatus = MediaStatus = {}));
let Media = class Media {
    originalName;
    filename;
    path;
    size;
    mimeType;
    type;
    status;
    userId;
    dimensions;
    thumbnailPath;
    metadata;
    tags;
    altText;
    isPublic;
    downloadCount;
};
exports.Media = Media;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original filename' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "originalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stored filename' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File path or URL' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Media.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MediaType, description: 'Type of media' }),
    (0, mongoose_1.Prop)({ required: true, enum: MediaType }),
    __metadata("design:type", String)
], Media.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MediaStatus, description: 'Processing status' }),
    (0, mongoose_1.Prop)({ required: true, enum: MediaStatus, default: MediaStatus.UPLOADING }),
    __metadata("design:type", String)
], Media.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who uploaded the file' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Media.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image dimensions' }),
    (0, mongoose_1.Prop)({
        type: {
            width: Number,
            height: Number,
        },
    }),
    __metadata("design:type", Object)
], Media.prototype, "dimensions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thumbnail path' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Media.prototype, "thumbnailPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            exif: Object,
            colorProfile: String,
            compression: String,
        },
    }),
    __metadata("design:type", Object)
], Media.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tags for organization' }),
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Media.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alt text for accessibility' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Media.prototype, "altText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether file is public' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Media.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Download count' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Media.prototype, "downloadCount", void 0);
exports.Media = Media = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Media);
exports.MediaSchema = mongoose_1.SchemaFactory.createForClass(Media);
//# sourceMappingURL=media.schema.js.map