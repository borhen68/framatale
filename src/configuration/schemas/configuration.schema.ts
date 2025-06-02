import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ConfigurationDocument = Configuration & Document;

export enum ConfigurationType {
  FEATURE_FLAG = 'FEATURE_FLAG',
  SYSTEM_SETTING = 'SYSTEM_SETTING',
  USER_PREFERENCE = 'USER_PREFERENCE',
  AB_TEST = 'AB_TEST',
  BUSINESS_RULE = 'BUSINESS_RULE',
  INTEGRATION_CONFIG = 'INTEGRATION_CONFIG',
  SECURITY_SETTING = 'SECURITY_SETTING',
}

export enum ConfigurationScope {
  GLOBAL = 'GLOBAL',
  USER = 'USER',
  TENANT = 'TENANT',
  ENVIRONMENT = 'ENVIRONMENT',
}

export enum DataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  ARRAY = 'ARRAY',
  DATE = 'DATE',
}

@Schema({ timestamps: true })
export class Configuration {
  @ApiProperty({ description: 'Configuration key' })
  @Prop({ required: true, index: true })
  key: string;

  @ApiProperty({ description: 'Configuration value' })
  @Prop({ required: true, type: Object })
  value: any;

  @ApiProperty({ enum: ConfigurationType, description: 'Type of configuration' })
  @Prop({ required: true, enum: ConfigurationType, index: true })
  type: ConfigurationType;

  @ApiProperty({ enum: ConfigurationScope, description: 'Configuration scope' })
  @Prop({ required: true, enum: ConfigurationScope, index: true })
  scope: ConfigurationScope;

  @ApiProperty({ enum: DataType, description: 'Data type of the value' })
  @Prop({ required: true, enum: DataType })
  dataType: DataType;

  @ApiProperty({ description: 'Configuration description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Configuration category/group' })
  @Prop({ index: true })
  category?: string;

  @ApiProperty({ description: 'Environment (dev, staging, prod)' })
  @Prop({ index: true })
  environment?: string;

  @ApiProperty({ description: 'User ID (for user-scoped configs)' })
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @ApiProperty({ description: 'Tenant ID (for multi-tenant configs)' })
  @Prop({ index: true })
  tenantId?: string;

  @ApiProperty({ description: 'Whether configuration is active' })
  @Prop({ default: true, index: true })
  isActive: boolean;

  @ApiProperty({ description: 'Whether configuration is encrypted' })
  @Prop({ default: false })
  isEncrypted: boolean;

  @ApiProperty({ description: 'Default value' })
  @Prop({ type: Object })
  defaultValue?: any;

  @ApiProperty({ description: 'Validation rules' })
  @Prop({
    type: {
      required: Boolean,
      min: Number,
      max: Number,
      pattern: String,
      enum: [String],
      custom: String,
    },
  })
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    custom?: string;
  };

  @ApiProperty({ description: 'A/B test configuration' })
  @Prop({
    type: {
      testName: String,
      variant: String,
      percentage: Number,
      startDate: Date,
      endDate: Date,
      targetAudience: Object,
    },
  })
  abTest?: {
    testName: string;
    variant: string;
    percentage: number;
    startDate: Date;
    endDate: Date;
    targetAudience?: Record<string, any>;
  };

  @ApiProperty({ description: 'Feature flag configuration' })
  @Prop({
    type: {
      enabled: Boolean,
      rolloutPercentage: Number,
      targetUsers: [String],
      targetGroups: [String],
      conditions: Object,
    },
  })
  featureFlag?: {
    enabled: boolean;
    rolloutPercentage?: number;
    targetUsers?: string[];
    targetGroups?: string[];
    conditions?: Record<string, any>;
  };

  @ApiProperty({ description: 'Configuration metadata' })
  @Prop({
    type: {
      createdBy: String,
      updatedBy: String,
      version: Number,
      tags: [String],
      source: String,
    },
  })
  metadata?: {
    createdBy?: string;
    updatedBy?: string;
    version?: number;
    tags?: string[];
    source?: string;
  };

  @ApiProperty({ description: 'Configuration expiration date' })
  @Prop()
  expiresAt?: Date;

  @ApiProperty({ description: 'Last accessed date' })
  @Prop()
  lastAccessedAt?: Date;

  @ApiProperty({ description: 'Access count' })
  @Prop({ default: 0 })
  accessCount: number;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

// Create compound indexes
ConfigurationSchema.index({ key: 1, scope: 1, environment: 1 });
ConfigurationSchema.index({ type: 1, isActive: 1 });
ConfigurationSchema.index({ userId: 1, type: 1 });
ConfigurationSchema.index({ category: 1, isActive: 1 });
