import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CanvasManagerService } from './canvas-manager.service';
import { TemplateManagerService } from './template-manager.service';
import { CanvasController } from './canvas.controller';
import { TemplateController } from './template.controller';
import { Canvas, CanvasSchema } from './schemas/canvas.schema';
import { Template, TemplateSchema } from './schemas/template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Canvas.name, schema: CanvasSchema },
      { name: Template.name, schema: TemplateSchema },
    ]),
  ],
  controllers: [CanvasController, TemplateController],
  providers: [CanvasManagerService, TemplateManagerService],
  exports: [CanvasManagerService, TemplateManagerService],
})
export class CanvasModule {}
