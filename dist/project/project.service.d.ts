import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserDocument } from '../user/schemas/user.schema';
export declare class ProjectService {
    private projectModel;
    constructor(projectModel: Model<ProjectDocument>);
    create(createProjectDto: CreateProjectDto, user: UserDocument): Promise<Project>;
    findAll(user: UserDocument): Promise<Project[]>;
    findById(id: string, user: UserDocument): Promise<ProjectDocument>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: UserDocument): Promise<Project>;
    delete(id: string, user: UserDocument): Promise<void>;
    findByStatus(status: ProjectStatus, user: UserDocument): Promise<Project[]>;
    findPublicProjects(): Promise<Project[]>;
    updateStatus(id: string, status: ProjectStatus, user: UserDocument): Promise<Project>;
    addImageToProject(projectId: string, imageId: string, user: UserDocument): Promise<ProjectDocument>;
    removeImageFromProject(projectId: string, imageId: string, user: UserDocument): Promise<ProjectDocument>;
}
