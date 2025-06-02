import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '../../common/schemas/product-size.schema';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface PageLayout {
  pageNumber: number;
  templateId: string;
  images: {
    imageId: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
    };
    effects?: {
      filter?: string;
      brightness?: number;
      contrast?: number;
      saturation?: number;
    };
  }[];
  text?: {
    content: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    style: {
      fontFamily: string;
      fontSize: number;
      color: string;
      fontWeight?: string;
      textAlign?: string;
    };
  }[];
}

@Schema({ timestamps: true })
export class Project {
  @ApiProperty({ description: 'Project title' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Project description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: ProductType, description: 'Type of product' })
  @Prop({ required: true, enum: ProductType })
  type: ProductType;

  @ApiProperty({ description: 'User ID who owns this project' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ enum: ProjectStatus, description: 'Project status' })
  @Prop({ required: true, enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @ApiProperty({ description: 'Product size code' })
  @Prop({ required: true })
  sizeCode: string;

  @ApiProperty({ description: 'Theme configuration' })
  @Prop({
    type: {
      name: String,
      primaryColor: String,
      secondaryColor: String,
      fontFamily: String,
      backgroundStyle: String,
    },
  })
  theme?: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    backgroundStyle: string;
  };

  @ApiProperty({ description: 'Array of page layouts' })
  @Prop({ type: [Object] })
  pages: PageLayout[];

  @ApiProperty({ description: 'Array of image IDs used in project' })
  @Prop({ type: [String] })
  images: string[];

  @ApiProperty({ description: 'Project cover image URL' })
  @Prop()
  coverImage?: string;

  @ApiProperty({ description: 'Total number of pages' })
  @Prop({ default: 1 })
  totalPages: number;

  @ApiProperty({ description: 'Project metadata' })
  @Prop({
    type: {
      autoLayoutApplied: { type: Boolean, default: false },
      lastAutoLayoutAt: Date,
      exportedAt: Date,
      printReadyAt: Date,
    },
  })
  metadata?: {
    autoLayoutApplied: boolean;
    lastAutoLayoutAt?: Date;
    exportedAt?: Date;
    printReadyAt?: Date;
  };

  @ApiProperty({ description: 'Project tags for organization' })
  @Prop({ type: [String] })
  tags?: string[];

  @ApiProperty({ description: 'Whether project is shared publicly' })
  @Prop({ default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'Project sharing settings' })
  @Prop({
    type: {
      shareToken: String,
      allowComments: { type: Boolean, default: false },
      allowDownload: { type: Boolean, default: false },
      expiresAt: Date,
    },
  })
  sharing?: {
    shareToken?: string;
    allowComments: boolean;
    allowDownload: boolean;
    expiresAt?: Date;
  };
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
