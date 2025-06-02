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
exports.TranslationSchema = exports.Translation = exports.TranslationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var TranslationStatus;
(function (TranslationStatus) {
    TranslationStatus["PENDING"] = "PENDING";
    TranslationStatus["TRANSLATED"] = "TRANSLATED";
    TranslationStatus["REVIEWED"] = "REVIEWED";
    TranslationStatus["APPROVED"] = "APPROVED";
    TranslationStatus["OUTDATED"] = "OUTDATED";
})(TranslationStatus || (exports.TranslationStatus = TranslationStatus = {}));
let Translation = class Translation {
    key;
    language;
    value;
    namespace;
    status;
    defaultValue;
    context;
    plurals;
    metadata;
    isMachineTranslated;
    confidence;
    usageCount;
    lastUsedAt;
};
exports.Translation = Translation;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Translation key' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Translation.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Language code (ISO 639-1)' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Translation.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Translated text' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Translation.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Namespace/category' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Translation.prototype, "namespace", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TranslationStatus, description: 'Translation status' }),
    (0, mongoose_1.Prop)({ required: true, enum: TranslationStatus, default: TranslationStatus.PENDING }),
    __metadata("design:type", String)
], Translation.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default/source text' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Translation.prototype, "defaultValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Context for translators' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Translation.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pluralization rules' }),
    (0, mongoose_1.Prop)({
        type: {
            zero: String,
            one: String,
            two: String,
            few: String,
            many: String,
            other: String,
        },
    }),
    __metadata("design:type", Object)
], Translation.prototype, "plurals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Translation metadata' }),
    (0, mongoose_1.Prop)({
        type: {
            translatedBy: String,
            reviewedBy: String,
            approvedBy: String,
            translationDate: Date,
            reviewDate: Date,
            approvalDate: Date,
            version: Number,
        },
    }),
    __metadata("design:type", Object)
], Translation.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a machine translation' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Translation.prototype, "isMachineTranslated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Translation confidence score (0-1)' }),
    (0, mongoose_1.Prop)({ min: 0, max: 1 }),
    __metadata("design:type", Number)
], Translation.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Usage count for analytics' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Translation.prototype, "usageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last used date' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Translation.prototype, "lastUsedAt", void 0);
exports.Translation = Translation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Translation);
exports.TranslationSchema = mongoose_1.SchemaFactory.createForClass(Translation);
exports.TranslationSchema.index({ key: 1, language: 1, namespace: 1 }, { unique: true });
exports.TranslationSchema.index({ language: 1, namespace: 1 });
exports.TranslationSchema.index({ status: 1, language: 1 });
//# sourceMappingURL=translation.schema.js.map