import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ComplianceRecordDocument = ComplianceRecord & Document;

export enum ComplianceType {
  GDPR_CONSENT = 'GDPR_CONSENT',
  GDPR_DATA_REQUEST = 'GDPR_DATA_REQUEST',
  GDPR_DATA_DELETION = 'GDPR_DATA_DELETION',
  CCPA_CONSENT = 'CCPA_CONSENT',
  CCPA_DATA_REQUEST = 'CCPA_DATA_REQUEST',
  COOKIE_CONSENT = 'COOKIE_CONSENT',
  TERMS_ACCEPTANCE = 'TERMS_ACCEPTANCE',
  PRIVACY_POLICY_ACCEPTANCE = 'PRIVACY_POLICY_ACCEPTANCE',
  DATA_RETENTION = 'DATA_RETENTION',
  DATA_BREACH = 'DATA_BREACH',
  AUDIT_LOG = 'AUDIT_LOG',
}

export enum ComplianceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

@Schema({ timestamps: true })
export class ComplianceRecord {
  @ApiProperty({ enum: ComplianceType, description: 'Type of compliance record' })
  @Prop({ required: true, enum: ComplianceType, index: true })
  type: ComplianceType;

  @ApiProperty({ enum: ComplianceStatus, description: 'Compliance status' })
  @Prop({ required: true, enum: ComplianceStatus, default: ComplianceStatus.PENDING })
  status: ComplianceStatus;

  @ApiProperty({ description: 'User ID (if applicable)' })
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @ApiProperty({ description: 'User email' })
  @Prop({ index: true })
  userEmail?: string;

  @ApiProperty({ description: 'IP address' })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent' })
  @Prop()
  userAgent?: string;

  @ApiProperty({ description: 'Compliance data' })
  @Prop({ type: Object })
  data: Record<string, any>;

  @ApiProperty({ description: 'Legal basis for processing' })
  @Prop()
  legalBasis?: string;

  @ApiProperty({ description: 'Consent details' })
  @Prop({
    type: {
      consentGiven: Boolean,
      consentWithdrawn: Boolean,
      consentDate: Date,
      withdrawalDate: Date,
      consentMethod: String,
      consentVersion: String,
    },
  })
  consent?: {
    consentGiven: boolean;
    consentWithdrawn: boolean;
    consentDate: Date;
    withdrawalDate?: Date;
    consentMethod: string;
    consentVersion: string;
  };

  @ApiProperty({ description: 'Data retention information' })
  @Prop({
    type: {
      retentionPeriod: Number,
      retentionUnit: String,
      retentionReason: String,
      scheduledDeletion: Date,
      actualDeletion: Date,
    },
  })
  retention?: {
    retentionPeriod: number;
    retentionUnit: 'days' | 'months' | 'years';
    retentionReason: string;
    scheduledDeletion: Date;
    actualDeletion?: Date;
  };

  @ApiProperty({ description: 'Request details' })
  @Prop({
    type: {
      requestType: String,
      requestDate: Date,
      responseDate: Date,
      requestMethod: String,
      verificationMethod: String,
      responseData: Object,
    },
  })
  request?: {
    requestType: string;
    requestDate: Date;
    responseDate?: Date;
    requestMethod: string;
    verificationMethod: string;
    responseData?: Record<string, any>;
  };

  @ApiProperty({ description: 'Expiration date' })
  @Prop({ index: true })
  expiresAt?: Date;

  @ApiProperty({ description: 'Processing notes' })
  @Prop()
  notes?: string;

  @ApiProperty({ description: 'Reference to related records' })
  @Prop({ type: [Types.ObjectId] })
  relatedRecords?: Types.ObjectId[];

  @ApiProperty({ description: 'Compliance officer who handled this' })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  handledBy?: Types.ObjectId;

  @ApiProperty({ description: 'Verification status' })
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Verification date' })
  @Prop()
  verifiedAt?: Date;
}

export const ComplianceRecordSchema = SchemaFactory.createForClass(ComplianceRecord);

// Create indexes for compliance queries
ComplianceRecordSchema.index({ type: 1, createdAt: -1 });
ComplianceRecordSchema.index({ userId: 1, type: 1 });
ComplianceRecordSchema.index({ userEmail: 1, type: 1 });
ComplianceRecordSchema.index({ expiresAt: 1 });
ComplianceRecordSchema.index({ status: 1, createdAt: -1 });
