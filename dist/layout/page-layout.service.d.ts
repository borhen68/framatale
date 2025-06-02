import { LayoutTemplateService } from './layout-template.service';
import { MetadataService } from '../metadata/metadata.service';
import { ProjectService } from '../project/project.service';
import { LayoutTemplate } from './schemas/layout-template.schema';
import { PageLayout } from '../project/schemas/project.schema';
import { ProductType } from '../common/schemas/product-size.schema';
export interface AutoLayoutOptions {
    projectId: string;
    imageIds: string[];
    productType: ProductType;
    preferredStyle?: 'minimal' | 'creative' | 'classic' | 'modern';
    allowMixedOrientation?: boolean;
    prioritizeFaces?: boolean;
    maxPagesPerTemplate?: number;
}
export interface LayoutSuggestion {
    templateId: string;
    template: LayoutTemplate;
    pages: PageLayout[];
    confidence: number;
    reasoning: string[];
}
export declare class PageLayoutService {
    private templateService;
    private metadataService;
    private projectService;
    constructor(templateService: LayoutTemplateService, metadataService: MetadataService, projectService: ProjectService);
    generateAutoLayout(options: AutoLayoutOptions): Promise<LayoutSuggestion[]>;
    applyLayoutToProject(projectId: string, templateId: string, imageIds: string[], userId: string): Promise<void>;
    private analyzeImageCollection;
    private findSuitableTemplates;
    private createLayoutSuggestion;
    private distributeImagesAcrossPages;
    private calculateImageFit;
    private calculateConfidenceScore;
    private generateReasoning;
}
