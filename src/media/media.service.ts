import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Media, MediaDocument, MediaType, MediaStatus } from './schemas/media.schema';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class MediaService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number;

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    private configService: ConfigService,
  ) {
    this.uploadPath = this.configService.get<string>('UPLOAD_DEST') || './uploads';
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE') || 10485760; // 10MB
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'thumbnails'), { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadDto: UploadMediaDto,
    user: UserDocument,
  ): Promise<Media> {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds maximum allowed size');
    }

    const fileExtension = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = path.join(this.uploadPath, filename);

    // Save file to disk
    await fs.writeFile(filePath, file.buffer);

    // Determine media type
    const mediaType = this.getMediaType(file.mimetype);

    // Create media record
    const media = new this.mediaModel({
      originalName: file.originalname,
      filename,
      path: filePath,
      size: file.size,
      mimeType: file.mimetype,
      type: mediaType,
      status: MediaStatus.PROCESSING,
      userId: user._id,
      altText: uploadDto.altText,
      tags: uploadDto.tags || [],
      isPublic: uploadDto.isPublic || false,
    });

    const savedMedia = await media.save();

    // Process file asynchronously
    this.processFile(savedMedia).catch(console.error);

    return savedMedia;
  }

  private async processFile(media: MediaDocument): Promise<void> {
    try {
      if (media.type === MediaType.IMAGE) {
        await this.processImage(media);
      }

      media.status = MediaStatus.READY;
      await media.save();
    } catch (error) {
      console.error('Error processing file:', error);
      media.status = MediaStatus.ERROR;
      await media.save();
    }
  }

  private async processImage(media: MediaDocument): Promise<void> {
    const image = sharp(media.path);
    const metadata = await image.metadata();

    // Update dimensions
    media.dimensions = {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };

    // Store metadata
    media.metadata = {
      exif: metadata.exif,
      colorProfile: (metadata as any).icc?.description,
      compression: metadata.compression,
    };

    // Generate thumbnail
    const thumbnailFilename = `thumb_${media.filename}`;
    const thumbnailPath = path.join(this.uploadPath, 'thumbnails', thumbnailFilename);

    await image
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    media.thumbnailPath = thumbnailPath;
    await media.save();
  }

  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    return MediaType.DOCUMENT;
  }

  async findAll(user: UserDocument): Promise<Media[]> {
    return this.mediaModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, user: UserDocument): Promise<MediaDocument> {
    const media = await this.mediaModel.findById(id).exec();

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check if user owns the media or if it's public
    if (media.userId.toString() !== (user._id as any).toString() && !media.isPublic) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async delete(id: string, user: UserDocument): Promise<void> {
    const media = await this.findById(id, user);

    // Only owner can delete
    if (media.userId.toString() !== (user._id as any).toString()) {
      throw new BadRequestException('You can only delete your own files');
    }

    // Delete files from disk
    try {
      await fs.unlink(media.path);
      if (media.thumbnailPath) {
        await fs.unlink(media.thumbnailPath);
      }
    } catch (error) {
      console.error('Error deleting files:', error);
    }

    await this.mediaModel.findByIdAndDelete(id);
  }

  async getFileStream(id: string, user: UserDocument): Promise<{ stream: Buffer; media: MediaDocument }> {
    const media = await this.findById(id, user);

    try {
      const fileBuffer = await fs.readFile(media.path);

      // Increment download count
      media.downloadCount += 1;
      await media.save();

      return { stream: fileBuffer, media };
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  async getThumbnail(id: string, user: UserDocument): Promise<{ stream: Buffer; media: MediaDocument }> {
    const media = await this.findById(id, user);

    if (!media.thumbnailPath) {
      throw new NotFoundException('Thumbnail not available');
    }

    try {
      const thumbnailBuffer = await fs.readFile(media.thumbnailPath);
      return { stream: thumbnailBuffer, media };
    } catch (error) {
      throw new NotFoundException('Thumbnail not found on disk');
    }
  }

  async updateTags(id: string, tags: string[], user: UserDocument): Promise<Media> {
    const media = await this.findById(id, user);

    if (media.userId.toString() !== (user._id as any).toString()) {
      throw new BadRequestException('You can only update your own files');
    }

    media.tags = tags;
    return media.save();
  }

  async findByTags(tags: string[], user: UserDocument): Promise<Media[]> {
    return this.mediaModel
      .find({
        userId: user._id,
        tags: { $in: tags }
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
