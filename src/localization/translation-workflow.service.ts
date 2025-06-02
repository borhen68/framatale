import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Translation, TranslationDocument, TranslationStatus } from './schemas/translation.schema';
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
    averageSpeed: number; // words per hour
    completionRate: number;
  };
  availability: {
    timezone: string;
    workingHours: { start: string; end: string };
    workingDays: number[];
  };
}

@Injectable()
export class TranslationWorkflowService {
  private projects: Map<string, TranslationProject> = new Map();
  private tasks: Map<string, TranslationTask> = new Map();
  private translators: Map<string, TranslatorProfile> = new Map();

  constructor(
    @InjectModel(Translation.name) private translationModel: Model<TranslationDocument>,
    private localizationService: LocalizationService,
  ) {
    this.initializeDefaultTranslators();
  }

  // Project Management
  async createTranslationProject(
    name: string,
    description: string,
    sourceLanguage: string,
    targetLanguages: string[],
    deadline?: Date,
  ): Promise<TranslationProject> {
    const project: TranslationProject = {
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

  async getTranslationProjects(): Promise<TranslationProject[]> {
    return Array.from(this.projects.values());
  }

  async getTranslationProject(projectId: string): Promise<TranslationProject> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException('Translation project not found');
    }
    return project;
  }

  async updateProjectProgress(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) return;

    const tasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);

    project.progress = {
      total: tasks.length,
      translated: tasks.filter(t => t.type === 'translate' && t.status === 'completed').length,
      reviewed: tasks.filter(t => t.type === 'review' && t.status === 'completed').length,
      approved: tasks.filter(t => t.type === 'approve' && t.status === 'completed').length,
    };

    // Update project status based on progress
    if (project.progress.approved === project.progress.total && project.progress.total > 0) {
      project.status = 'completed';
    } else if (project.progress.translated > 0) {
      project.status = 'in_progress';
    }

    project.updatedAt = new Date();
    this.projects.set(projectId, project);
  }

  // Task Management
  async createTranslationTasks(
    projectId: string,
    keys: string[],
    namespace: string,
  ): Promise<TranslationTask[]> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException('Translation project not found');
    }

    const tasks: TranslationTask[] = [];

    for (const targetLanguage of project.targetLanguages) {
      for (const key of keys) {
        // Create translation task
        const translationTask: TranslationTask = {
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

        // Create review task
        const reviewTask: TranslationTask = {
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

  async getTranslatorTasks(translatorId: string): Promise<TranslationTask[]> {
    return Array.from(this.tasks.values()).filter(t => t.assignedTo === translatorId);
  }

  async updateTaskStatus(
    taskId: string,
    status: TranslationTask['status'],
    comment?: string,
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
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

    // Send notifications
    await this.sendTaskNotification(task, status);
  }

  // Translator Management
  async getTranslators(): Promise<TranslatorProfile[]> {
    return Array.from(this.translators.values());
  }

  async getTranslatorsByLanguage(languageCode: string): Promise<TranslatorProfile[]> {
    return Array.from(this.translators.values()).filter(t =>
      t.languages.some(l => l.code === languageCode)
    );
  }

  async updateTranslatorWorkload(translatorId: string, workload: number): Promise<void> {
    const translator = this.translators.get(translatorId);
    if (translator) {
      translator.workload.current = workload;
      this.translators.set(translatorId, translator);
    }
  }

  // Translation UI Support
  async getTranslationWorkbench(translatorId: string): Promise<any> {
    const tasks = await this.getTranslatorTasks(translatorId);
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');

    const workbenchData = await Promise.all(
      pendingTasks.map(async (task) => {
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
      })
    );

    return {
      translator: this.translators.get(translatorId),
      tasks: workbenchData,
      statistics: await this.getTranslatorStatistics(translatorId),
    };
  }

  async submitTranslation(
    taskId: string,
    translatedText: string,
    comment?: string,
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Update the translation in the database
    const [key, language, namespace] = task.translationId.split('_');

    await this.translationModel
      .findOneAndUpdate(
        { key, language, namespace },
        {
          value: translatedText,
          status: TranslationStatus.TRANSLATED,
          'metadata.translatedBy': task.assignedTo,
          'metadata.translationDate': new Date(),
        },
        { upsert: true }
      )
      .exec();

    // Update task status
    await this.updateTaskStatus(taskId, 'completed', comment);

    // Update translator performance
    await this.updateTranslatorPerformance(task.assignedTo, 'translation_completed');
  }

  // Quality Assurance
  async getTranslationQualityReport(projectId: string): Promise<any> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const tasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const qualityMetrics = {
      totalTranslations: completedTasks.filter(t => t.type === 'translate').length,
      averageQuality: 0,
      issuesFound: 0,
      revisionRate: 0,
      translatorPerformance: {} as Record<string, any>,
    };

    // Calculate quality metrics
    const translatorStats = new Map<string, any>();

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

      // Count issues from review comments
      const issues = task.comments.filter(c => c.message.includes('issue') || c.message.includes('error'));
      stats.issues += issues.length;
    });

    qualityMetrics.translatorPerformance = Object.fromEntries(translatorStats);

    return qualityMetrics;
  }

  // Machine Translation Integration
  async getMachineTranslationSuggestions(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string[]> {
    // Integration with Google Translate, DeepL, or other MT services
    // This is a placeholder implementation
    return [
      `MT Suggestion 1 for "${text}"`,
      `MT Suggestion 2 for "${text}"`,
    ];
  }

  // Private helper methods
  private async assignTranslator(language: string, key: string): Promise<string> {
    const availableTranslators = await this.getTranslatorsByLanguage(language);

    // Simple assignment based on workload
    const translator = availableTranslators
      .filter(t => t.workload.current < t.workload.capacity)
      .sort((a, b) => a.workload.current - b.workload.current)[0];

    return translator?.userId || 'unassigned';
  }

  private async assignReviewer(language: string): Promise<string> {
    const availableReviewers = await this.getTranslatorsByLanguage(language);

    // Assign reviewer with highest quality score
    const reviewer = availableReviewers
      .filter(t => t.workload.current < t.workload.capacity)
      .sort((a, b) => b.performance.averageQuality - a.performance.averageQuality)[0];

    return reviewer?.userId || 'unassigned';
  }

  private async getTranslationContext(translationId: string): Promise<any> {
    // Get context information for the translation
    return {
      usage: 'UI element',
      maxLength: 50,
      tone: 'professional',
      audience: 'end-users',
    };
  }

  private async getTranslationSuggestions(translationId: string): Promise<string[]> {
    // Get translation suggestions from various sources
    return [
      'Translation memory match',
      'Machine translation suggestion',
      'Similar translation from glossary',
    ];
  }

  private async getTranslatorStatistics(translatorId: string): Promise<any> {
    const tasks = await this.getTranslatorTasks(translatorId);

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      averageCompletionTime: 0, // Calculate from task data
      qualityScore: 0, // Calculate from review feedback
    };
  }

  private async sendTaskNotification(task: TranslationTask, status: string): Promise<void> {
    // Send notification via email (placeholder - would integrate with email service)
    console.log(`Sending notification to ${task.assignedTo}: Translation Task ${status}`);
    // TODO: Integrate with email service
  }

  private async updateTranslatorPerformance(translatorId: string, event: string): Promise<void> {
    const translator = this.translators.get(translatorId);
    if (!translator) return;

    // Update performance metrics based on the event
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

  private initializeDefaultTranslators(): void {
    // Initialize with sample translators
    const sampleTranslators: TranslatorProfile[] = [
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
}
