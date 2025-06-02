import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ImageMetadataDocument = ImageMetadata & Document;

@Schema({ timestamps: true })
export class ImageMetadata {
  @ApiProperty({ description: 'Reference to media file' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Media', unique: true })
  mediaId: Types.ObjectId;

  @ApiProperty({ description: 'Image orientation' })
  @Prop({ required: true, enum: ['portrait', 'landscape', 'square'] })
  orientation: 'portrait' | 'landscape' | 'square';

  @ApiProperty({ description: 'Aspect ratio' })
  @Prop({ required: true })
  aspectRatio: number;

  @ApiProperty({ description: 'Image dimensions' })
  @Prop({
    required: true,
    type: {
      width: Number,
      height: Number,
    },
  })
  dimensions: {
    width: number;
    height: number;
  };

  @ApiProperty({ description: 'EXIF data' })
  @Prop({
    type: {
      dateTime: Date,
      camera: String,
      lens: String,
      focalLength: Number,
      aperture: Number,
      iso: Number,
      exposureTime: String,
      gps: {
        latitude: Number,
        longitude: Number,
      },
    },
  })
  exifData?: {
    dateTime?: Date;
    camera?: string;
    lens?: string;
    focalLength?: number;
    aperture?: number;
    iso?: number;
    exposureTime?: string;
    gps?: {
      latitude?: number;
      longitude?: number;
    };
  };

  @ApiProperty({ description: 'Dominant color information' })
  @Prop({
    required: true,
    type: {
      hex: String,
      rgb: {
        r: Number,
        g: Number,
        b: Number,
      },
      hsl: {
        h: Number,
        s: Number,
        l: Number,
      },
    },
  })
  dominantColor: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };

  @ApiProperty({ description: 'Color palette' })
  @Prop({
    type: [{
      hex: String,
      rgb: {
        r: Number,
        g: Number,
        b: Number,
      },
      percentage: Number,
    }],
  })
  colorPalette: Array<{
    hex: string;
    rgb: { r: number; g: number; b: number };
    percentage: number;
  }>;

  @ApiProperty({ description: 'Image quality metrics' })
  @Prop({
    required: true,
    type: {
      sharpness: Number,
      brightness: Number,
      contrast: Number,
    },
  })
  quality: {
    sharpness: number;
    brightness: number;
    contrast: number;
  };

  @ApiProperty({ description: 'Detected faces' })
  @Prop({
    type: [{
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      confidence: Number,
    }],
  })
  faces?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;

  @ApiProperty({ description: 'AI-generated tags' })
  @Prop({ type: [String] })
  aiTags?: string[];

  @ApiProperty({ description: 'Suitability scores for different layouts' })
  @Prop({
    type: {
      fullPage: Number,
      halfPage: Number,
      quarter: Number,
      collage: Number,
    },
  })
  layoutSuitability?: {
    fullPage: number;
    halfPage: number;
    quarter: number;
    collage: number;
  };
}

export const ImageMetadataSchema = SchemaFactory.createForClass(ImageMetadata);
