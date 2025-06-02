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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const media_schema_1 = require("./schemas/media.schema");
let MediaService = class MediaService {
    mediaModel;
    configService;
    uploadPath;
    maxFileSize;
    constructor(mediaModel, configService) {
        this.mediaModel = mediaModel;
        this.configService = configService;
        this.uploadPath = this.configService.get('UPLOAD_DEST') || './uploads';
        this.maxFileSize = this.configService.get('MAX_FILE_SIZE') || 10485760;
        this.ensureUploadDirectory();
    }
    async ensureUploadDirectory() {
        try {
            await fs.access(this.uploadPath);
        }
        catch {
            await fs.mkdir(this.uploadPath, { recursive: true });
            await fs.mkdir(path.join(this.uploadPath, 'thumbnails'), { recursive: true });
        }
    }
    async uploadFile(file, uploadDto, user) {
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('File size exceeds maximum allowed size');
        }
        const fileExtension = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
        const filePath = path.join(this.uploadPath, filename);
        await fs.writeFile(filePath, file.buffer);
        const mediaType = this.getMediaType(file.mimetype);
        const media = new this.mediaModel({
            originalName: file.originalname,
            filename,
            path: filePath,
            size: file.size,
            mimeType: file.mimetype,
            type: mediaType,
            status: media_schema_1.MediaStatus.PROCESSING,
            userId: user._id,
            altText: uploadDto.altText,
            tags: uploadDto.tags || [],
            isPublic: uploadDto.isPublic || false,
        });
        const savedMedia = await media.save();
        this.processFile(savedMedia).catch(console.error);
        return savedMedia;
    }
    async processFile(media) {
        try {
            if (media.type === media_schema_1.MediaType.IMAGE) {
                await this.processImage(media);
            }
            media.status = media_schema_1.MediaStatus.READY;
            await media.save();
        }
        catch (error) {
            console.error('Error processing file:', error);
            media.status = media_schema_1.MediaStatus.ERROR;
            await media.save();
        }
    }
    async processImage(media) {
        const image = sharp(media.path);
        const metadata = await image.metadata();
        media.dimensions = {
            width: metadata.width || 0,
            height: metadata.height || 0,
        };
        media.metadata = {
            exif: metadata.exif,
            colorProfile: metadata.icc?.description,
            compression: metadata.compression,
        };
        const thumbnailFilename = `thumb_${media.filename}`;
        const thumbnailPath = path.join(this.uploadPath, 'thumbnails', thumbnailFilename);
        await image
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        media.thumbnailPath = thumbnailPath;
        await media.save();
    }
    getMediaType(mimeType) {
        if (mimeType.startsWith('image/'))
            return media_schema_1.MediaType.IMAGE;
        if (mimeType.startsWith('video/'))
            return media_schema_1.MediaType.VIDEO;
        return media_schema_1.MediaType.DOCUMENT;
    }
    async findAll(user) {
        return this.mediaModel
            .find({ userId: user._id })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findById(id, user) {
        const media = await this.mediaModel.findById(id).exec();
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        if (media.userId.toString() !== user._id.toString() && !media.isPublic) {
            throw new common_1.NotFoundException('Media not found');
        }
        return media;
    }
    async delete(id, user) {
        const media = await this.findById(id, user);
        if (media.userId.toString() !== user._id.toString()) {
            throw new common_1.BadRequestException('You can only delete your own files');
        }
        try {
            await fs.unlink(media.path);
            if (media.thumbnailPath) {
                await fs.unlink(media.thumbnailPath);
            }
        }
        catch (error) {
            console.error('Error deleting files:', error);
        }
        await this.mediaModel.findByIdAndDelete(id);
    }
    async getFileStream(id, user) {
        const media = await this.findById(id, user);
        try {
            const fileBuffer = await fs.readFile(media.path);
            media.downloadCount += 1;
            await media.save();
            return { stream: fileBuffer, media };
        }
        catch (error) {
            throw new common_1.NotFoundException('File not found on disk');
        }
    }
    async getThumbnail(id, user) {
        const media = await this.findById(id, user);
        if (!media.thumbnailPath) {
            throw new common_1.NotFoundException('Thumbnail not available');
        }
        try {
            const thumbnailBuffer = await fs.readFile(media.thumbnailPath);
            return { stream: thumbnailBuffer, media };
        }
        catch (error) {
            throw new common_1.NotFoundException('Thumbnail not found on disk');
        }
    }
    async updateTags(id, tags, user) {
        const media = await this.findById(id, user);
        if (media.userId.toString() !== user._id.toString()) {
            throw new common_1.BadRequestException('You can only update your own files');
        }
        media.tags = tags;
        return media.save();
    }
    async findByTags(tags, user) {
        return this.mediaModel
            .find({
            userId: user._id,
            tags: { $in: tags }
        })
            .sort({ createdAt: -1 })
            .exec();
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(media_schema_1.Media.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map