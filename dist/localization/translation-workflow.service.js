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
exports.TranslationWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const translation_schema_1 = require("./schemas/translation.schema");
const localization_service_1 = require("./localization.service");
let TranslationWorkflowService = class TranslationWorkflowService {
    translationModel;
    localizationService;
    projects = new Map();
    tasks = new Map();
    translators = new Map();
    constructor(translationModel, localizationService) {
        this.translationModel = translationModel;
        this.localizationService = localizationService;
        this.initializeDefaultTranslators();
    }
    async createTranslationProject(name, description, sourceLanguage, targetLanguages, deadline) {
        const project = {
            id: `proj_${Date.now()}`,
            name,
            description,
            sourceLanguage,
            targetLanguages,
            status: 'draft',
            deadline,
            assignedTranslators: [],
            assignedReviewers: [],
            progress: { total: 0, translated: 0, reviewed: 0, approved: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.projects.set(project.id, project);
        return project;
    }
    async getTranslationProjects() {
        return Array.from(this.projects.values());
    }
    async getTranslationProject(projectId) {
        const project = this.projects.get(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Translation project not found');
        }
        return project;
    }
    async updateProjectProgress(projectId) {
        const project = this.projects.get(projectId);
        if (!project)
            return;
        const tasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
        project.progress = {
            total: tasks.length,
            translated: tasks.filter(t => t.type === 'translate' && t.status === 'completed').length,
            reviewed: tasks.filter(t => t.type === 'review' && t.status === 'completed').length,
            approved: tasks.filter(t => t.type === 'approve' && t.status === 'completed').length,
        };
        if (project.progress.approved === project.progress.total && project.progress.total > 0) {
            project.status = 'completed';
        }
        else if (project.progress.translated > 0) {
            project.status = 'in_progress';
        }
        project.updatedAt = new Date();
        this.projects.set(projectId, project);
    }
    async createTranslationTasks(projectId, keys, namespace) {
        const project = this.projects.get(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Translation project not found');
        }
        const tasks = [];
        for (const targetLanguage of project.targetLanguages) {
            for (const key of keys) {
                const translationTask = {
                    id: `task_${Date.now()}_${Math.random()}`,
                    projectId,
                    translationId: `${key}_${targetLanguage}_${namespace}`,
                    assignedTo: await this.assignTranslator(targetLanguage, key),
                    type: 'translate',
                    status: 'pending',
                    priority: 'normal',
                    comments: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                tasks.push(translationTask);
                this.tasks.set(translationTask.id, translationTask);
                const reviewTask = {
                    id: `task_${Date.now()}_${Math.random()}`,
                    projectId,
                    translationId: `${key}_${targetLanguage}_${namespace}`,
                    assignedTo: await this.assignReviewer(targetLanguage),
                    type: 'review',
                    status: 'pending',
                    priority: 'normal',
                    comments: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                tasks.push(reviewTask);
                this.tasks.set(reviewTask.id, reviewTask);
            }
        }
        await this.updateProjectProgress(projectId);
        return tasks;
    }
    async getTranslatorTasks(translatorId) {
        return Array.from(this.tasks.values()).filter(t => t.assignedTo === translatorId);
    }
    async updateTaskStatus(taskId, status, comment) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        task.status = status;
        task.updatedAt = new Date();
        if (comment) {
            task.comments.push({
                author: task.assignedTo,
                message: comment,
                timestamp: new Date(),
            });
        }
        this.tasks.set(taskId, task);
        await this.updateProjectProgress(task.projectId);
        await this.sendTaskNotification(task, status);
    }
    async getTranslators() {
        return Array.from(this.translators.values());
    }
    async getTranslatorsByLanguage(languageCode) {
        return Array.from(this.translators.values()).filter(t => t.languages.some(l => l.code === languageCode));
    }
    async updateTranslatorWorkload(translatorId, workload) {
        const translator = this.translators.get(translatorId);
        if (translator) {
            translator.workload.current = workload;
            this.translators.set(translatorId, translator);
        }
    }
    async getTranslationWorkbench(translatorId) {
        const tasks = await this.getTranslatorTasks(translatorId);
        const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
        const workbenchData = await Promise.all(pendingTasks.map(async (task) => {
            const translation = await this.translationModel
                .findOne({
                key: task.translationId.split('_')[0],
                language: task.translationId.split('_')[1],
                namespace: task.translationId.split('_')[2],
            })
                .exec();
            return {
                task,
                translation,
                context: await this.getTranslationContext(task.translationId),
                suggestions: await this.getTranslationSuggestions(task.translationId),
            };
        }));
        return {
            translator: this.translators.get(translatorId),
            tasks: workbenchData,
            statistics: await this.getTranslatorStatistics(translatorId),
        };
    }
    async submitTranslation(taskId, translatedText, comment) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const [key, language, namespace] = task.translationId.split('_');
        await this.translationModel
            .findOneAndUpdate({ key, language, namespace }, {
            value: translatedText,
            status: translation_schema_1.TranslationStatus.TRANSLATED,
            'metadata.translatedBy': task.assignedTo,
            'metadata.translationDate': new Date(),
        }, { upsert: true })
            .exec();
        await this.updateTaskStatus(taskId, 'completed', comment);
        await this.updateTranslatorPerformance(task.assignedTo, 'translation_completed');
    }
    async getTranslationQualityReport(projectId) {
        const project = this.projects.get(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const tasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const qualityMetrics = {
            totalTranslations: completedTasks.filter(t => t.type === 'translate').length,
            averageQuality: 0,
            issuesFound: 0,
            revisionRate: 0,
            translatorPerformance: {},
        };
        const translatorStats = new Map();
        completedTasks.forEach(task => {
            if (!translatorStats.has(task.assignedTo)) {
                translatorStats.set(task.assignedTo, {
                    completed: 0,
                    issues: 0,
                    averageTime: 0,
                });
            }
            const stats = translatorStats.get(task.assignedTo);
            stats.completed++;
            const issues = task.comments.filter(c => c.message.includes('issue') || c.message.includes('error'));
            stats.issues += issues.length;
        });
        qualityMetrics.translatorPerformance = Object.fromEntries(translatorStats);
        return qualityMetrics;
    }
    async getMachineTranslationSuggestions(text, sourceLanguage, targetLanguage) {
        return [
            `MT Suggestion 1 for "${text}"`,
            `MT Suggestion 2 for "${text}"`,
        ];
    }
    async assignTranslator(language, key) {
        const availableTranslators = await this.getTranslatorsByLanguage(language);
        const translator = availableTranslators
            .filter(t => t.workload.current < t.workload.capacity)
            .sort((a, b) => a.workload.current - b.workload.current)[0];
        return translator?.userId || 'unassigned';
    }
    async assignReviewer(language) {
        const availableReviewers = await this.getTranslatorsByLanguage(language);
        const reviewer = availableReviewers
            .filter(t => t.workload.current < t.workload.capacity)
            .sort((a, b) => b.performance.averageQuality - a.performance.averageQuality)[0];
        return reviewer?.userId || 'unassigned';
    }
    async getTranslationContext(translationId) {
        return {
            usage: 'UI element',
            maxLength: 50,
            tone: 'professional',
            audience: 'end-users',
        };
    }
    async getTranslationSuggestions(translationId) {
        return [
            'Translation memory match',
            'Machine translation suggestion',
            'Similar translation from glossary',
        ];
    }
    async getTranslatorStatistics(translatorId) {
        const tasks = await this.getTranslatorTasks(translatorId);
        return {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            pendingTasks: tasks.filter(t => t.status === 'pending').length,
            averageCompletionTime: 0,
            qualityScore: 0,
        };
    }
    async sendTaskNotification(task, status) {
        console.log(`Sending notification to ${task.assignedTo}: Translation Task ${status}`);
    }
    async updateTranslatorPerformance(translatorId, event) {
        const translator = this.translators.get(translatorId);
        if (!translator)
            return;
        switch (event) {
            case 'translation_completed':
                translator.performance.completionRate += 0.1;
                break;
            case 'quality_issue':
                translator.performance.averageQuality -= 0.1;
                break;
        }
        this.translators.set(translatorId, translator);
    }
    initializeDefaultTranslators() {
        const sampleTranslators = [
            {
                userId: 'translator_1',
                name: 'Maria Garcia',
                email: 'maria@frametale.com',
                languages: [
                    { code: 'es', proficiency: 'native', specializations: ['UI', 'marketing'] },
                    { code: 'en', proficiency: 'fluent', specializations: ['technical'] },
                ],
                workload: { current: 5, capacity: 20 },
                performance: { averageQuality: 9.2, averageSpeed: 250, completionRate: 95 },
                availability: {
                    timezone: 'Europe/Madrid',
                    workingHours: { start: '09:00', end: '17:00' },
                    workingDays: [1, 2, 3, 4, 5],
                },
            },
            {
                userId: 'translator_2',
                name: 'Jean Dupont',
                email: 'jean@frametale.com',
                languages: [
                    { code: 'fr', proficiency: 'native', specializations: ['UI', 'legal'] },
                    { code: 'en', proficiency: 'fluent', specializations: ['business'] },
                ],
                workload: { current: 8, capacity: 25 },
                performance: { averageQuality: 8.9, averageSpeed: 200, completionRate: 92 },
                availability: {
                    timezone: 'Europe/Paris',
                    workingHours: { start: '08:30', end: '16:30' },
                    workingDays: [1, 2, 3, 4, 5],
                },
            },
        ];
        sampleTranslators.forEach(translator => {
            this.translators.set(translator.userId, translator);
        });
    }
};
exports.TranslationWorkflowService = TranslationWorkflowService;
exports.TranslationWorkflowService = TranslationWorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(translation_schema_1.Translation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        localization_service_1.LocalizationService])
], TranslationWorkflowService);
//# sourceMappingURL=translation-workflow.service.js.map