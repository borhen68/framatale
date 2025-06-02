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
exports.ImageMetadataSchema = exports.ImageMetadata = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let ImageMetadata = class ImageMetadata {
    mediaId;
    orientation;
    aspectRatio;
    dimensions;
    exifData;
    dominantColor;
    colorPalette;
    quality;
    faces;
    aiTags;
    layoutSuitability;
};
exports.ImageMetadata = ImageMetadata;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to media file' }),
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Media', unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ImageMetadata.prototype, "mediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image orientation' }),
    (0, mongoose_1.Prop)({ required: true, enum: ['portrait', 'landscape', 'square'] }),
    __metadata("design:type", String)
], ImageMetadata.prototype, "orientation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Aspect ratio' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ImageMetadata.prototype, "aspectRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image dimensions' }),
    (0, mongoose_1.Prop)({
        required: true,
        type: {
            width: Number,
            height: Number,
        },
    }),
    __metadata("design:type", Object)
], ImageMetadata.prototype, "dimensions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'EXIF data' }),
    (0, mongoose_1.Prop)({
        type: {
            dateTime: Date,
            camera: String,
            lens: String,
            focalLength: Number,
            aperture: Number,
            iso: Number,
            exposureTime: String,
            gps: {
                latitude: Number,
                longitude: Number,
            },
        },
    }),
    __metadata("design:type", Object)
], ImageMetadata.prototype, "exifData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dominant color information' }),
    (0, mongoose_1.Prop)({
        required: true,
        type: {
            hex: String,
            rgb: {
                r: Number,
                g: Number,
                b: Number,
            },
            hsl: {
                h: Number,
                s: Number,
                l: Number,
            },
        },
    }),
    __metadata("design:type", Object)
], ImageMetadata.prototype, "dominantColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Color palette' }),
    (0, mongoose_1.Prop)({
        type: [{
                hex: String,
                rgb: {
                    r: Number,
                    g: Number,
                    b: Number,
                },
                percentage: Number,
            }],
    }),
    __metadata("design:type", Array)
], ImageMetadata.prototype, "colorPalette", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image quality metrics' }),
    (0, mongoose_1.Prop)({
        required: true,
        type: {
            sharpness: Number,
            brightness: Number,
            contrast: Number,
        },
    }),
    __metadata("design:type", Object)
], ImageMetadata.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Detected faces' }),
    (0, mongoose_1.Prop)({
        type: [{
                x: Number,
                y: Number,
                width: Number,
                height: Number,
                confidence: Number,
            }],
    }),
    __metadata("design:type", Array)
], ImageMetadata.prototype, "faces", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AI-generated tags' }),
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], ImageMetadata.prototype, "aiTags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Suitability scores for different layouts' }),
    (0, mongoose_1.Prop)({
        type: {
            fullPage: Number,
            halfPage: Number,
            quarter: Number,
            collage: Number,
        },
    }),
    __metadata("design:type", Object)
], ImageMetadata.prototype, "layoutSuitability", void 0);
exports.ImageMetadata = ImageMetadata = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ImageMetadata);
exports.ImageMetadataSchema = mongoose_1.SchemaFactory.createForClass(ImageMetadata);
//# sourceMappingURL=image-metadata.schema.js.map