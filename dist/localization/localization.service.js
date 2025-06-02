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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const translation_schema_1 = require("./schemas/translation.schema");
let LocalizationService = class LocalizationService {
    translationModel;
    supportedLanguages = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'
    ];
    defaultLanguage = 'en';
    translationCache = new Map();
    constructor(translationModel) {
        this.translationModel = translationModel;
        this.loadTranslationsToCache();
    }
    async createTranslation(request) {
        const translation = new this.translationModel({
            ...request,
            status: translation_schema_1.TranslationStatus.PENDING,
            metadata: {
                translationDate: new Date(),
                version: 1,
            },
        });
        const saved = await translation.save();
        this.invalidateCache(request.language, request.namespace);
        return saved;
    }
    async updateTranslation(key, language, namespace, updates) {
        const translation = await this.translationModel
            .findOneAndUpdate({ key, language, namespace }, {
            ...updates,
            'metadata.reviewDate': new Date(),
            $inc: { 'metadata.version': 1 },
        }, { new: true })
            .exec();
        if (!translation) {
            throw new common_1.NotFoundException('Translation not found');
        }
        this.invalidateCache(language, namespace);
        return translation;
    }
    async translate(key, options) {
        const { language, namespace = 'default', fallbackLanguage = this.defaultLanguage, interpolation, count } = options;
        const cacheKey = `${language}:${namespace}`;
        let translations = this.translationCache.get(cacheKey);
        if (!translations) {
            translations = await this.loadTranslations(language, namespace);
            this.translationCache.set(cacheKey, translations);
        }
        let translation = translations[key];
        if (!translation && language !== fallbackLanguage) {
            const fallbackCacheKey = `${fallbackLanguage}:${namespace}`;
            let fallbackTranslations = this.translationCache.get(fallbackCacheKey);
            if (!fallbackTranslations) {
                fallbackTranslations = await this.loadTranslations(fallbackLanguage, namespace);
                this.translationCache.set(fallbackCacheKey, fallbackTranslations);
            }
            translation = fallbackTranslations[key];
        }
        if (!translation) {
            return key;
        }
        if (typeof count === 'number' && translation.plurals) {
            translation = this.getPluralForm(translation, count, language);
        }
        else {
            translation = translation.value || translation;
        }
        if (interpolation && typeof translation === 'string') {
            translation = this.interpolate(translation, interpolation);
        }
        this.trackUsage(key, language, namespace);
        return translation;
    }
    async getTranslations(language, namespace) {
        const query = { language, status: { $in: [translation_schema_1.TranslationStatus.APPROVED, translation_schema_1.TranslationStatus.TRANSLATED] } };
        if (namespace)
            query.namespace = namespace;
        const translations = await this.translationModel.find(query).exec();
        const result = {};
        translations.forEach(t => {
            result[t.key] = t.plurals ? { value: t.value, plurals: t.plurals } : t.value;
        });
        return result;
    }
    async getNamespaces() {
        return this.translationModel.distinct('namespace').exec();
    }
    async getSupportedLanguages() {
        return this.supportedLanguages;
    }
    async getTranslationStats() {
        const stats = await this.translationModel.aggregate([
            {
                $group: {
                    _id: { language: '$language', status: '$status' },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: '$_id.language',
                    statuses: {
                        $push: {
                            status: '$_id.status',
                            count: '$count',
                        },
                    },
                    total: { $sum: '$count' },
                },
            },
        ]);
        return stats.reduce((acc, lang) => {
            acc[lang._id] = {
                total: lang.total,
                statuses: lang.statuses.reduce((statusAcc, s) => {
                    statusAcc[s.status] = s.count;
                    return statusAcc;
                }, {}),
            };
            return acc;
        }, {});
    }
    async getMissingTranslations(targetLanguage, sourceLanguage = this.defaultLanguage) {
        const sourceKeys = await this.translationModel
            .distinct('key', { language: sourceLanguage })
            .exec();
        const targetKeys = await this.translationModel
            .distinct('key', { language: targetLanguage })
            .exec();
        return sourceKeys.filter(key => !targetKeys.includes(key));
    }
    async bulkImportTranslations(language, namespace, translations) {
        let imported = 0;
        let updated = 0;
        const errors = [];
        for (const [key, value] of Object.entries(translations)) {
            try {
                const existing = await this.translationModel
                    .findOne({ key, language, namespace })
                    .exec();
                if (existing) {
                    existing.value = value;
                    existing.status = translation_schema_1.TranslationStatus.PENDING;
                    existing.metadata = {
                        ...existing.metadata,
                        translationDate: new Date(),
                        version: (existing.metadata?.version || 0) + 1,
                    };
                    await existing.save();
                    updated++;
                }
                else {
                    await this.createTranslation({
                        key,
                        language,
                        value,
                        namespace,
                    });
                    imported++;
                }
            }
            catch (error) {
                errors.push(`Failed to import ${key}: ${error.message}`);
            }
        }
        this.invalidateCache(language, namespace);
        return { imported, updated, errors };
    }
    async exportTranslations(language, namespace) {
        const query = { language };
        if (namespace)
            query.namespace = namespace;
        const translations = await this.translationModel.find(query).exec();
        return translations.reduce((acc, t) => {
            acc[t.key] = t.value;
            return acc;
        }, {});
    }
    async loadTranslations(language, namespace) {
        const translations = await this.translationModel
            .find({
            language,
            namespace,
            status: { $in: [translation_schema_1.TranslationStatus.APPROVED, translation_schema_1.TranslationStatus.TRANSLATED] },
        })
            .exec();
        const result = {};
        translations.forEach(t => {
            result[t.key] = t.plurals ? { value: t.value, plurals: t.plurals } : { value: t.value };
        });
        return result;
    }
    async loadTranslationsToCache() {
        const commonNamespaces = ['common', 'ui', 'errors'];
        for (const language of this.supportedLanguages) {
            for (const namespace of commonNamespaces) {
                const translations = await this.loadTranslations(language, namespace);
                this.translationCache.set(`${language}:${namespace}`, translations);
            }
        }
    }
    getPluralForm(translation, count, language) {
        if (!translation.plurals)
            return translation.value;
        const rules = this.getPluralRules(language);
        const form = rules(count);
        return translation.plurals[form] || translation.plurals.other || translation.value;
    }
    getPluralRules(language) {
        switch (language) {
            case 'en':
                return (count) => count === 1 ? 'one' : 'other';
            case 'ru':
                return (count) => {
                    if (count % 10 === 1 && count % 100 !== 11)
                        return 'one';
                    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20))
                        return 'few';
                    return 'many';
                };
            default:
                return (count) => count === 1 ? 'one' : 'other';
        }
    }
    interpolate(text, values) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return values[key] !== undefined ? String(values[key]) : match;
        });
    }
    async trackUsage(key, language, namespace) {
        setImmediate(async () => {
            try {
                await this.translationModel
                    .updateOne({ key, language, namespace }, {
                    $inc: { usageCount: 1 },
                    $set: { lastUsedAt: new Date() },
                })
                    .exec();
            }
            catch (error) {
            }
        });
    }
    invalidateCache(language, namespace) {
        this.translationCache.delete(`${language}:${namespace}`);
    }
};
exports.LocalizationService = LocalizationService;
exports.LocalizationService = LocalizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(translation_schema_1.Translation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LocalizationService);
//# sourceMappingURL=localization.service.js.map