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
exports.ConfigurationSchema = exports.Configuration = exports.DataType = exports.ConfigurationScope = exports.ConfigurationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var ConfigurationType;
(function (ConfigurationType) {
    ConfigurationType["FEATURE_FLAG"] = "FEATURE_FLAG";
    ConfigurationType["SYSTEM_SETTING"] = "SYSTEM_SETTING";
    ConfigurationType["USER_PREFERENCE"] = "USER_PREFERENCE";
    ConfigurationType["AB_TEST"] = "AB_TEST";
    ConfigurationType["BUSINESS_RULE"] = "BUSINESS_RULE";
    ConfigurationType["INTEGRATION_CONFIG"] = "INTEGRATION_CONFIG";
    ConfigurationType["SECURITY_SETTING"] = "SECURITY_SETTING";
})(ConfigurationType || (exports.ConfigurationType = ConfigurationType = {}));
var ConfigurationScope;
(function (ConfigurationScope) {
    ConfigurationScope["GLOBAL"] = "GLOBAL";
    ConfigurationScope["USER"] = "USER";
    ConfigurationScope["TENANT"] = "TENANT";
    ConfigurationScope["ENVIRONMENT"] = "ENVIRONMENT";
})(ConfigurationScope || (exports.ConfigurationScope = ConfigurationScope = {}));
var DataType;
(function (DataType) {
    DataType["STRING"] = "STRING";
    DataType["NUMBER"] = "NUMBER";
    DataType["BOOLEAN"] = "BOOLEAN";
    DataType["JSON"] = "JSON";
    DataType["ARRAY"] = "ARRAY";
    DataType["DATE"] = "DATE";
})(DataType || (exports.DataType = DataType = {}));
let Configuration = class Configuration {
    key;
    value;
    type;
    scope;
    dataType;
    description;
    category;
    environment;
    userId;
    tenantId;
    isActive;
    isEncrypted;
    defaultValue;
    validation;
    abTest;
    featureFlag;
    metadata;
    expiresAt;
    lastAccessedAt;
    accessCount;
};
exports.Configuration = Configuration;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration key' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Configuration.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration value' }),
    (0, mongoose_1.Prop)({ required: true, type: Object }),
    __metadata("design:type", Object)
], Configuration.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ConfigurationType, description: 'Type of configuration' }),
    (0, mongoose_1.Prop)({ required: true, enum: ConfigurationType, index: true }),
    __metadata("design:type", String)
], Configuration.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ConfigurationScope, description: 'Configuration scope' }),
    (0, mongoose_1.Prop)({ required: true, enum: ConfigurationScope, index: true }),
    __metadata("design:type", String)
], Configuration.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DataType, description: 'Data type of the value' }),
    (0, mongoose_1.Prop)({ required: true, enum: DataType }),
    __metadata("design:type", String)
], Configuration.prototype, "dataType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration description' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Configuration.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration category/group' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], Configuration.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Environment (dev, staging, prod)' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], Configuration.prototype, "environment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID (for user-scoped configs)' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Configuration.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenant ID (for multi-tenant configs)' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], Configuration.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether configuration is active' }),
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether configuration is encrypted' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isEncrypted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default value' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Configuration.prototype, "defaultValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Validation rules' }),
    (0, mongoose_1.Prop)({
        type: {
            required: Boolean,
            min: Number,
            max: Number,
            pattern: String,
            enum: [String],
            custom: String,
        },
    }),
    __metadata("design:type", Object)
], Configuration.prototype, "validation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'A/B test configuration' }),
    (0, mongoose_1.Prop)({
        type: {
            testName: String,
            variant: String,
            percentage: Number,
            startDate: Date,
            endDate: Date,
            targetAudience: Object,
        },
    }),
    __metadata("design:type", Object)
], Configuration.prototype, "abTest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Feature flag configuration' }),
    (0, mongoose_1.Prop)({
        type: {
            enabled: Boolean,
            rolloutPercentage: Number,
            targetUsers: [String],
            targetGroups: [String],
            conditions: Object,
        },
    }),
    __metadata("design:type", Object)
], Configuration.prototype, "featureFlag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            createdBy: String,
            updatedBy: String,
            version: Number,
            tags: [String],
            source: String,
        },
    }),
    __metadata("design:type", Object)
], Configuration.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration expiration date' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Configuration.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last accessed date' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Configuration.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access count' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Configuration.prototype, "accessCount", void 0);
exports.Configuration = Configuration = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Configuration);
exports.ConfigurationSchema = mongoose_1.SchemaFactory.createForClass(Configuration);
exports.ConfigurationSchema.index({ key: 1, scope: 1, environment: 1 });
exports.ConfigurationSchema.index({ type: 1, isActive: 1 });
exports.ConfigurationSchema.index({ userId: 1, type: 1 });
exports.ConfigurationSchema.index({ category: 1, isActive: 1 });
//# sourceMappingURL=configuration.schema.js.map