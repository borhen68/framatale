import { Model } from 'mongoose';
import { TranslationDocument } from './schemas/translation.schema';
import { LocalizationService } from './localization.service';
export interface TranslationProject {
    id: string;
    name: string;
    description: string;
    sourceLanguage: string;
    targetLanguages: string[];
    status: 'draft' | 'in_progress' | 'review' | 'completed';
    deadline?: Date;
    assignedTranslators: string[];
    assignedReviewers: string[];
    progress: {
        total: number;
        translated: number;
        reviewed: number;
        approved: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface TranslationTask {
    id: string;
    projectId: string;
    translationId: string;
    assignedTo: string;
    type: 'translate' | 'review' | 'approve';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    deadline?: Date;
    comments: Array<{
        author: string;
        message: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export interface TranslatorProfile {
    userId: string;
    name: string;
    email: string;
    languages: Array<{
        code: string;
        proficiency: 'native' | 'fluent' | 'intermediate' | 'beginner';
        specializations: string[];
    }>;
    workload: {
        current: number;
        capacity: number;
    };
    performance: {
        averageQuality: number;
        averageSpeed: number;
        completionRate: number;
    };
    availability: {
        timezone: string;
        workingHours: {
            start: string;
            end: string;
        };
        workingDays: number[];
    };
}
export declare class TranslationWorkflowService {
    private translationModel;
    private localizationService;
    private projects;
    private tasks;
    private translators;
    constructor(translationModel: Model<TranslationDocument>, localizationService: LocalizationService);
    createTranslationProject(name: string, description: string, sourceLanguage: string, targetLanguages: string[], deadline?: Date): Promise<TranslationProject>;
    getTranslationProjects(): Promise<TranslationProject[]>;
    getTranslationProject(projectId: string): Promise<TranslationProject>;
    updateProjectProgress(projectId: string): Promise<void>;
    createTranslationTasks(projectId: string, keys: string[], namespace: string): Promise<TranslationTask[]>;
    getTranslatorTasks(translatorId: string): Promise<TranslationTask[]>;
    updateTaskStatus(taskId: string, status: TranslationTask['status'], comment?: string): Promise<void>;
    getTranslators(): Promise<TranslatorProfile[]>;
    getTranslatorsByLanguage(languageCode: string): Promise<TranslatorProfile[]>;
    updateTranslatorWorkload(translatorId: string, workload: number): Promise<void>;
    getTranslationWorkbench(translatorId: string): Promise<any>;
    submitTranslation(taskId: string, translatedText: string, comment?: string): Promise<void>;
    getTranslationQualityReport(projectId: string): Promise<any>;
    getMachineTranslationSuggestions(text: string, sourceLanguage: string, targetLanguage: string): Promise<string[]>;
    private assignTranslator;
    private assignReviewer;
    private getTranslationContext;
    private getTranslationSuggestions;
    private getTranslatorStatistics;
    private sendTaskNotification;
    private updateTranslatorPerformance;
    private initializeDefaultTranslators;
}
