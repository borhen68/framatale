import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIEnhancementService } from './ai-enhancement.service';
import { AIEnhancementController } from './ai-enhancement.controller';
import { EnhancementJob, EnhancementJobSchema } from './schemas/enhancement-job.schema';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EnhancementJob.name, schema: EnhancementJobSchema }]),
    MediaModule,
  ],
  controllers: [AIEnhancementController],
  providers: [AIEnhancementService],
  exports: [AIEnhancementService],
})
export class AIEnhancementModule {}
