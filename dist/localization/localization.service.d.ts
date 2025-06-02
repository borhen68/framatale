import { Model } from 'mongoose';
import { Translation, TranslationDocument } from './schemas/translation.schema';
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
export declare class LocalizationService {
    private translationModel;
    private readonly supportedLanguages;
    private readonly defaultLanguage;
    private translationCache;
    constructor(translationModel: Model<TranslationDocument>);
    createTranslation(request: CreateTranslationRequest): Promise<Translation>;
    updateTranslation(key: string, language: string, namespace: string, updates: Partial<Translation>): Promise<Translation>;
    translate(key: string, options: LocalizationOptions): Promise<string>;
    getTranslations(language: string, namespace?: string): Promise<Record<string, any>>;
    getNamespaces(): Promise<string[]>;
    getSupportedLanguages(): Promise<string[]>;
    getTranslationStats(): Promise<any>;
    getMissingTranslations(targetLanguage: string, sourceLanguage?: string): Promise<string[]>;
    bulkImportTranslations(language: string, namespace: string, translations: Record<string, string>): Promise<{
        imported: number;
        updated: number;
        errors: string[];
    }>;
    exportTranslations(language: string, namespace?: string): Promise<Record<string, string>>;
    private loadTranslations;
    private loadTranslationsToCache;
    private getPluralForm;
    private getPluralRules;
    private interpolate;
    private trackUsage;
    private invalidateCache;
}
