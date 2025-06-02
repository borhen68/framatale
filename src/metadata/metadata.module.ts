import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { ImageMetadata, ImageMetadataSchema } from './schemas/image-metadata.schema';
import { ImageAnalyzerModule } from '../image-analyzer/image-analyzer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ImageMetadata.name, schema: ImageMetadataSchema }]),
    ImageAnalyzerModule,
  ],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
