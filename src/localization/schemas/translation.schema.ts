import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TranslationDocument = Translation & Document;

export enum TranslationStatus {
  PENDING = 'PENDING',
  TRANSLATED = 'TRANSLATED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  OUTDATED = 'OUTDATED',
}

@Schema({ timestamps: true })
export class Translation {
  @ApiProperty({ description: 'Translation key' })
  @Prop({ required: true, index: true })
  key: string;

  @ApiProperty({ description: 'Language code (ISO 639-1)' })
  @Prop({ required: true, index: true })
  language: string;

  @ApiProperty({ description: 'Translated text' })
  @Prop({ required: true })
  value: string;

  @ApiProperty({ description: 'Namespace/category' })
  @Prop({ required: true, index: true })
  namespace: string;

  @ApiProperty({ enum: TranslationStatus, description: 'Translation status' })
  @Prop({ required: true, enum: TranslationStatus, default: TranslationStatus.PENDING })
  status: TranslationStatus;

  @ApiProperty({ description: 'Default/source text' })
  @Prop()
  defaultValue?: string;

  @ApiProperty({ description: 'Context for translators' })
  @Prop()
  context?: string;

  @ApiProperty({ description: 'Pluralization rules' })
  @Prop({
    type: {
      zero: String,
      one: String,
      two: String,
      few: String,
      many: String,
      other: String,
    },
  })
  plurals?: {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other?: string;
  };

  @ApiProperty({ description: 'Translation metadata' })
  @Prop({
    type: {
      translatedBy: String,
      reviewedBy: String,
      approvedBy: String,
      translationDate: Date,
      reviewDate: Date,
      approvalDate: Date,
      version: Number,
    },
  })
  metadata?: {
    translatedBy?: string;
    reviewedBy?: string;
    approvedBy?: string;
    translationDate?: Date;
    reviewDate?: Date;
    approvalDate?: Date;
    version?: number;
  };

  @ApiProperty({ description: 'Whether this is a machine translation' })
  @Prop({ default: false })
  isMachineTranslated: boolean;

  @ApiProperty({ description: 'Translation confidence score (0-1)' })
  @Prop({ min: 0, max: 1 })
  confidence?: number;

  @ApiProperty({ description: 'Usage count for analytics' })
  @Prop({ default: 0 })
  usageCount: number;

  @ApiProperty({ description: 'Last used date' })
  @Prop()
  lastUsedAt?: Date;
}

export const TranslationSchema = SchemaFactory.createForClass(Translation);

// Create compound indexes
TranslationSchema.index({ key: 1, language: 1, namespace: 1 }, { unique: true });
TranslationSchema.index({ language: 1, namespace: 1 });
TranslationSchema.index({ status: 1, language: 1 });
