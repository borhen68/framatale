import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Media, MediaDocument } from './schemas/media.schema';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UserDocument } from '../user/schemas/user.schema';
export declare class MediaService {
    private mediaModel;
    private configService;
    private readonly uploadPath;
    private readonly maxFileSize;
    constructor(mediaModel: Model<MediaDocument>, configService: ConfigService);
    private ensureUploadDirectory;
    uploadFile(file: Express.Multer.File, uploadDto: UploadMediaDto, user: UserDocument): Promise<Media>;
    private processFile;
    private processImage;
    private getMediaType;
    findAll(user: UserDocument): Promise<Media[]>;
    findById(id: string, user: UserDocument): Promise<MediaDocument>;
    delete(id: string, user: UserDocument): Promise<void>;
    getFileStream(id: string, user: UserDocument): Promise<{
        stream: Buffer;
        media: MediaDocument;
    }>;
    getThumbnail(id: string, user: UserDocument): Promise<{
        stream: Buffer;
        media: MediaDocument;
    }>;
    updateTags(id: string, tags: string[], user: UserDocument): Promise<Media>;
    findByTags(tags: string[], user: UserDocument): Promise<Media[]>;
}
