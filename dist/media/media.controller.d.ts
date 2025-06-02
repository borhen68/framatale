import { Response } from 'express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Media } from './schemas/media.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    uploadFile(file: Express.Multer.File, uploadDto: UploadMediaDto, user: UserDocument): Promise<Media>;
    findAll(user: UserDocument, tags?: string): Promise<Media[]>;
    findById(id: string, user: UserDocument): Promise<Media>;
    downloadFile(id: string, user: UserDocument, res: Response): Promise<void>;
    getThumbnail(id: string, user: UserDocument, res: Response): Promise<void>;
    updateTags(id: string, tags: string[], user: UserDocument): Promise<Media>;
    delete(id: string, user: UserDocument): Promise<{
        message: string;
    }>;
}
