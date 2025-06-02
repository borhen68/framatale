import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Translation, TranslationDocument, TranslationStatus } from './schemas/translation.schema';

export interface CreateTranslationRequest {
  key: string;
  language: string;
  value: string;
  namespace: string;
  defaultValue?: string;
  context?: string;
  plurals?: Record<string, string>;
}

export interface LocalizationOptions {
  language: string;
  namespace?: string;
  fallbackLanguage?: string;
  interpolation?: Record<string, any>;
  count?: number;
}

@Injectable()
export class LocalizationService {
  private readonly supportedLanguages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'
  ];

  private readonly defaultLanguage = 'en';
  private translationCache = new Map<string, any>();

  constructor(
    @InjectModel(Translation.name) private translationModel: Model<TranslationDocument>,
  ) {
    this.loadTranslationsToCache();
  }

  async createTranslation(request: CreateTranslationRequest): Promise<Translation> {
    const translation = new this.translationModel({
      ...request,
      status: TranslationStatus.PENDING,
      metadata: {
        translationDate: new Date(),
        version: 1,
      },
    });

    const saved = await translation.save();
    this.invalidateCache(request.language, request.namespace);
    return saved;
  }

  async updateTranslation(
    key: string,
    language: string,
    namespace: string,
    updates: Partial<Translation>,
  ): Promise<Translation> {
    const translation = await this.translationModel
      .findOneAndUpdate(
        { key, language, namespace },
        {
          ...updates,
          'metadata.reviewDate': new Date(),
          $inc: { 'metadata.version': 1 },
        },
        { new: true }
      )
      .exec();

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    this.invalidateCache(language, namespace);
    return translation;
  }

  async translate(
    key: string,
    options: LocalizationOptions,
  ): Promise<string> {
    const { language, namespace = 'default', fallbackLanguage = this.defaultLanguage, interpolation, count } = options;

    // Try to get from cache first
    const cacheKey = `${language}:${namespace}`;
    let translations = this.translationCache.get(cacheKey);

    if (!translations) {
      translations = await this.loadTranslations(language, namespace);
      this.translationCache.set(cacheKey, translations);
    }

    let translation = translations[key];

    // Fallback to default language if not found
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
      return key; // Return key if no translation found
    }

    // Handle pluralization
    if (typeof count === 'number' && translation.plurals) {
      translation = this.getPluralForm(translation, count, language);
    } else {
      translation = translation.value || translation;
    }

    // Handle interpolation
    if (interpolation && typeof translation === 'string') {
      translation = this.interpolate(translation, interpolation);
    }

    // Track usage
    this.trackUsage(key, language, namespace);

    return translation;
  }

  async getTranslations(language: string, namespace?: string): Promise<Record<string, any>> {
    const query: any = { language, status: { $in: [TranslationStatus.APPROVED, TranslationStatus.TRANSLATED] } };
    if (namespace) query.namespace = namespace;

    const translations = await this.translationModel.find(query).exec();
    
    const result: Record<string, any> = {};
    translations.forEach(t => {
      result[t.key] = t.plurals ? { value: t.value, plurals: t.plurals } : t.value;
    });

    return result;
  }

  async getNamespaces(): Promise<string[]> {
    return this.translationModel.distinct('namespace').exec();
  }

  async getSupportedLanguages(): Promise<string[]> {
    return this.supportedLanguages;
  }

  async getTranslationStats(): Promise<any> {
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
        statuses: lang.statuses.reduce((statusAcc: any, s: any) => {
          statusAcc[s.status] = s.count;
          return statusAcc;
        }, {}),
      };
      return acc;
    }, {});
  }

  async getMissingTranslations(targetLanguage: string, sourceLanguage: string = this.defaultLanguage): Promise<string[]> {
    const sourceKeys = await this.translationModel
      .distinct('key', { language: sourceLanguage })
      .exec();

    const targetKeys = await this.translationModel
      .distinct('key', { language: targetLanguage })
      .exec();

    return sourceKeys.filter(key => !targetKeys.includes(key));
  }

  async bulkImportTranslations(
    language: string,
    namespace: string,
    translations: Record<string, string>,
  ): Promise<{ imported: number; updated: number; errors: string[] }> {
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const [key, value] of Object.entries(translations)) {
      try {
        const existing = await this.translationModel
          .findOne({ key, language, namespace })
          .exec();

        if (existing) {
          existing.value = value;
          existing.status = TranslationStatus.PENDING;
          existing.metadata = {
            ...existing.metadata,
            translationDate: new Date(),
            version: (existing.metadata?.version || 0) + 1,
          };
          await existing.save();
          updated++;
        } else {
          await this.createTranslation({
            key,
            language,
            value,
            namespace,
          });
          imported++;
        }
      } catch (error) {
        errors.push(`Failed to import ${key}: ${error.message}`);
      }
    }

    this.invalidateCache(language, namespace);
    return { imported, updated, errors };
  }

  async exportTranslations(language: string, namespace?: string): Promise<Record<string, string>> {
    const query: any = { language };
    if (namespace) query.namespace = namespace;

    const translations = await this.translationModel.find(query).exec();
    
    return translations.reduce((acc, t) => {
      acc[t.key] = t.value;
      return acc;
    }, {} as Record<string, string>);
  }

  private async loadTranslations(language: string, namespace: string): Promise<Record<string, any>> {
    const translations = await this.translationModel
      .find({
        language,
        namespace,
        status: { $in: [TranslationStatus.APPROVED, TranslationStatus.TRANSLATED] },
      })
      .exec();

    const result: Record<string, any> = {};
    translations.forEach(t => {
      result[t.key] = t.plurals ? { value: t.value, plurals: t.plurals } : { value: t.value };
    });

    return result;
  }

  private async loadTranslationsToCache(): Promise<void> {
    // Load commonly used translations into cache on startup
    const commonNamespaces = ['common', 'ui', 'errors'];
    
    for (const language of this.supportedLanguages) {
      for (const namespace of commonNamespaces) {
        const translations = await this.loadTranslations(language, namespace);
        this.translationCache.set(`${language}:${namespace}`, translations);
      }
    }
  }

  private getPluralForm(translation: any, count: number, language: string): string {
    if (!translation.plurals) return translation.value;

    // Simplified pluralization rules (in production, use a proper i18n library)
    const rules = this.getPluralRules(language);
    const form = rules(count);

    return translation.plurals[form] || translation.plurals.other || translation.value;
  }

  private getPluralRules(language: string): (count: number) => string {
    // Simplified plural rules - in production, use Intl.PluralRules
    switch (language) {
      case 'en':
        return (count: number) => count === 1 ? 'one' : 'other';
      case 'ru':
        return (count: number) => {
          if (count % 10 === 1 && count % 100 !== 11) return 'one';
          if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'few';
          return 'many';
        };
      default:
        return (count: number) => count === 1 ? 'one' : 'other';
    }
  }

  private interpolate(text: string, values: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  }

  private async trackUsage(key: string, language: string, namespace: string): Promise<void> {
    // Track usage asynchronously without blocking the response
    setImmediate(async () => {
      try {
        await this.translationModel
          .updateOne(
            { key, language, namespace },
            {
              $inc: { usageCount: 1 },
              $set: { lastUsedAt: new Date() },
            }
          )
          .exec();
      } catch (error) {
        // Ignore tracking errors
      }
    });
  }

  private invalidateCache(language: string, namespace: string): void {
    this.translationCache.delete(`${language}:${namespace}`);
  }
}
