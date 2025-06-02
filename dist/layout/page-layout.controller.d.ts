import { PageLayoutService, AutoLayoutOptions, LayoutSuggestion } from './page-layout.service';
import { UserDocument } from '../user/schemas/user.schema';
export declare class PageLayoutController {
    private pageLayoutService;
    constructor(pageLayoutService: PageLayoutService);
    generateAutoLayout(options: AutoLayoutOptions, user: UserDocument): Promise<LayoutSuggestion[]>;
    applyLayout(request: {
        projectId: string;
        templateId: string;
        imageIds: string[];
    }, user: UserDocument): Promise<{
        message: string;
    }>;
}
