import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocalizationService } from './localization.service';
import { LocalizationController } from './localization.controller';
import { Translation, TranslationSchema } from './schemas/translation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Translation.name, schema: TranslationSchema }]),
  ],
  controllers: [LocalizationController],
  providers: [LocalizationService],
  exports: [LocalizationService],
})
export class LocalizationModule {}
