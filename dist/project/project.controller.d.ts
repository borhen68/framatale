import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectStatus } from './schemas/project.schema';
import { UserDocument } from '../user/schemas/user.schema';
export declare class ProjectController {
    private projectService;
    constructor(projectService: ProjectService);
    create(createProjectDto: CreateProjectDto, user: UserDocument): Promise<Project>;
    findAll(user: UserDocument, status?: ProjectStatus): Promise<Project[]>;
    findPublicProjects(): Promise<Project[]>;
    findById(id: string, user: UserDocument): Promise<Project>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: UserDocument): Promise<Project>;
    delete(id: string, user: UserDocument): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: ProjectStatus, user: UserDocument): Promise<Project>;
    addImage(projectId: string, imageId: string, user: UserDocument): Promise<Project>;
    removeImage(projectId: string, imageId: string, user: UserDocument): Promise<Project>;
}
