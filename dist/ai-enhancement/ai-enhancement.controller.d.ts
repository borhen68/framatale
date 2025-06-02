import { AIEnhancementService, EnhancementRequest } from './ai-enhancement.service';
import { EnhancementJob } from './schemas/enhancement-job.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class AIEnhancementController {
    private enhancementService;
    constructor(enhancementService: AIEnhancementService);
    createEnhancement(request: EnhancementRequest, user: UserDocument): Promise<EnhancementJob>;
    getUserJobs(user: UserDocument): Promise<EnhancementJob[]>;
    getJobStatus(jobId: string, user: UserDocument): Promise<EnhancementJob>;
    cancelJob(jobId: string, user: UserDocument): Promise<{
        message: string;
    }>;
}
