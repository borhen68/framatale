import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EnhancementJob, EnhancementJobDocument, EnhancementType } from './schemas/enhancement-job.schema';
import { MediaService } from '../media/media.service';
import { UserDocument } from '../user/schemas/user.schema';
export interface EnhancementRequest {
    mediaId: string;
    enhancementType: EnhancementType;
    parameters?: {
        scale?: number;
        quality?: number;
        preserveTransparency?: boolean;
        styleReference?: string;
        customSettings?: Record<string, any>;
    };
}
export declare class AIEnhancementService {
    private jobModel;
    private mediaService;
    private configService;
    constructor(jobModel: Model<EnhancementJobDocument>, mediaService: MediaService, configService: ConfigService);
    createEnhancementJob(request: EnhancementRequest, user: UserDocument): Promise<EnhancementJob>;
    getJobStatus(jobId: string, user: UserDocument): Promise<EnhancementJob>;
    getUserJobs(user: UserDocument): Promise<EnhancementJob[]>;
    cancelJob(jobId: string, user: UserDocument): Promise<void>;
    private processEnhancement;
    private upscaleImage;
    private removeBackground;
    private reduceNoise;
    private correctColors;
    private sharpenImage;
    private transferStyle;
    private calculateQualityScore;
    private estimateProcessingTime;
    private cancelExternalJob;
}
