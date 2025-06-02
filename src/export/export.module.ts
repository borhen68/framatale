import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { ExportJob, ExportJobSchema } from './schemas/export-job.schema';
import { ProjectModule } from '../project/project.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExportJob.name, schema: ExportJobSchema }]),
    ProjectModule,
    MediaModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
