import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LayoutTemplateService } from './layout-template.service';
import { LayoutTemplateController } from './layout-template.controller';
import { PageLayoutService } from './page-layout.service';
import { PageLayoutController } from './page-layout.controller';
import { LayoutTemplate, LayoutTemplateSchema } from './schemas/layout-template.schema';
import { MetadataModule } from '../metadata/metadata.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LayoutTemplate.name, schema: LayoutTemplateSchema }]),
    MetadataModule,
    ProjectModule,
  ],
  controllers: [LayoutTemplateController, PageLayoutController],
  providers: [LayoutTemplateService, PageLayoutService],
  exports: [LayoutTemplateService, PageLayoutService],
})
export class LayoutModule {}
