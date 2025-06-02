import { Module } from '@nestjs/common';
import { ImageAnalyzerService } from './image-analyzer.service';

@Module({
  providers: [ImageAnalyzerService],
  exports: [ImageAnalyzerService],
})
export class ImageAnalyzerModule {}
