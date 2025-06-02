import { LocalizationService, CreateTranslationRequest } from './localization.service';
import { Translation } from './schemas/translation.schema';
export declare class LocalizationController {
    private localizationService;
    constructor(localizationService: LocalizationService);
    createTranslation(request: CreateTranslationRequest): Promise<Translation>;
    translate(key: string, language: string, namespace?: string, count?: number): Promise<{
        translation: string;
    }>;
    getTranslations(language: string, namespace?: string): Promise<Record<string, any>>;
    getSupportedLanguages(): Promise<{
        languages: string[];
    }>;
    getNamespaces(): Promise<{
        namespaces: string[];
    }>;
    getTranslationStats(): Promise<any>;
    getMissingTranslations(targetLanguage: string, sourceLanguage?: string): Promise<{
        missing: string[];
    }>;
    bulkImportTranslations(language: string, namespace: string, translations: Record<string, string>): Promise<{
        imported: number;
        updated: number;
        errors: string[];
    }>;
    exportTranslations(language: string, namespace?: string): Promise<Record<string, string>>;
}
