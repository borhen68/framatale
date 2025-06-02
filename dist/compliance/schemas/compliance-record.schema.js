"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceRecordSchema = exports.ComplianceRecord = exports.ComplianceStatus = exports.ComplianceType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var ComplianceType;
(function (ComplianceType) {
    ComplianceType["GDPR_CONSENT"] = "GDPR_CONSENT";
    ComplianceType["GDPR_DATA_REQUEST"] = "GDPR_DATA_REQUEST";
    ComplianceType["GDPR_DATA_DELETION"] = "GDPR_DATA_DELETION";
    ComplianceType["CCPA_CONSENT"] = "CCPA_CONSENT";
    ComplianceType["CCPA_DATA_REQUEST"] = "CCPA_DATA_REQUEST";
    ComplianceType["COOKIE_CONSENT"] = "COOKIE_CONSENT";
    ComplianceType["TERMS_ACCEPTANCE"] = "TERMS_ACCEPTANCE";
    ComplianceType["PRIVACY_POLICY_ACCEPTANCE"] = "PRIVACY_POLICY_ACCEPTANCE";
    ComplianceType["DATA_RETENTION"] = "DATA_RETENTION";
    ComplianceType["DATA_BREACH"] = "DATA_BREACH";
    ComplianceType["AUDIT_LOG"] = "AUDIT_LOG";
})(ComplianceType || (exports.ComplianceType = ComplianceType = {}));
var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["PENDING"] = "PENDING";
    ComplianceStatus["APPROVED"] = "APPROVED";
    ComplianceStatus["REJECTED"] = "REJECTED";
    ComplianceStatus["COMPLETED"] = "COMPLETED";
    ComplianceStatus["EXPIRED"] = "EXPIRED";
})(ComplianceStatus || (exports.ComplianceStatus = ComplianceStatus = {}));
let ComplianceRecord = class ComplianceRecord {
    type;
    status;
    userId;
    userEmail;
    ipAddress;
    userAgent;
    data;
    legalBasis;
    consent;
    retention;
    request;
    expiresAt;
    notes;
    relatedRecords;
    handledBy;
    isVerified;
    verifiedAt;
};
exports.ComplianceRecord = ComplianceRecord;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ComplianceType, description: 'Type of compliance record' }),
    (0, mongoose_1.Prop)({ required: true, enum: ComplianceType, index: true }),
    __metadata("design:type", String)
], ComplianceRecord.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ComplianceStatus, description: 'Compliance status' }),
    (0, mongoose_1.Prop)({ required: true, enum: ComplianceStatus, default: ComplianceStatus.PENDING }),
    __metadata("design:type", String)
], ComplianceRecord.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID (if applicable)' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ComplianceRecord.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User email' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], ComplianceRecord.prototype, "userEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IP address' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ComplianceRecord.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User agent' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ComplianceRecord.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Compliance data' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ComplianceRecord.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Legal basis for processing' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ComplianceRecord.prototype, "legalBasis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Consent details' }),
    (0, mongoose_1.Prop)({
        type: {
            consentGiven: Boolean,
            consentWithdrawn: Boolean,
            consentDate: Date,
            withdrawalDate: Date,
            consentMethod: String,
            consentVersion: String,
        },
    }),
    __metadata("design:type", Object)
], ComplianceRecord.prototype, "consent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Data retention information' }),
    (0, mongoose_1.Prop)({
        type: {
            retentionPeriod: Number,
            retentionUnit: String,
            retentionReason: String,
            scheduledDeletion: Date,
            actualDeletion: Date,
        },
    }),
    __metadata("design:type", Object)
], ComplianceRecord.prototype, "retention", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Request details' }),
    (0, mongoose_1.Prop)({
        type: {
            requestType: String,
            requestDate: Date,
            responseDate: Date,
            requestMethod: String,
            verificationMethod: String,
            responseData: Object,
        },
    }),
    __metadata("design:type", Object)
], ComplianceRecord.prototype, "request", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration date' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", Date)
], ComplianceRecord.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing notes' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ComplianceRecord.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to related records' }),
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId] }),
    __metadata("design:type", Array)
], ComplianceRecord.prototype, "relatedRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Compliance officer who handled this' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ComplianceRecord.prototype, "handledBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Verification status' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ComplianceRecord.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Verification date' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ComplianceRecord.prototype, "verifiedAt", void 0);
exports.ComplianceRecord = ComplianceRecord = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ComplianceRecord);
exports.ComplianceRecordSchema = mongoose_1.SchemaFactory.createForClass(ComplianceRecord);
exports.ComplianceRecordSchema.index({ type: 1, createdAt: -1 });
exports.ComplianceRecordSchema.index({ userId: 1, type: 1 });
exports.ComplianceRecordSchema.index({ userEmail: 1, type: 1 });
exports.ComplianceRecordSchema.index({ expiresAt: 1 });
exports.ComplianceRecordSchema.index({ status: 1, createdAt: -1 });
//# sourceMappingURL=compliance-record.schema.js.map