import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: UserDocument): Promise<Project> {
    const project = new this.projectModel({
      ...createProjectDto,
      userId: user._id,
      pages: [],
      images: createProjectDto.images || [],
      totalPages: createProjectDto.totalPages || 1,
      status: ProjectStatus.DRAFT,
    });

    return project.save();
  }

  async findAll(user: UserDocument): Promise<Project[]> {
    return this.projectModel
      .find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string, user: UserDocument): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid project ID');
    }

    const project = await this.projectModel.findById(id).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user owns the project or if it's public
    if (project.userId.toString() !== (user._id as any).toString() && !project.isPublic) {
      throw new ForbiddenException('Access denied to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: UserDocument): Promise<Project> {
    const project = await this.findById(id, user);

    // Only owner can update
    if (project.userId.toString() !== (user._id as any).toString()) {
      throw new ForbiddenException('You can only update your own projects');
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .exec();

    if (!updatedProject) {
      throw new NotFoundException('Project not found');
    }

    return updatedProject;
  }

  async delete(id: string, user: UserDocument): Promise<void> {
    const project = await this.findById(id, user);

    // Only owner can delete
    if (project.userId.toString() !== (user._id as any).toString()) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.projectModel.findByIdAndDelete(id).exec();
  }

  async findByStatus(status: ProjectStatus, user: UserDocument): Promise<Project[]> {
    return this.projectModel
      .find({ userId: user._id, status })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findPublicProjects(): Promise<Project[]> {
    return this.projectModel
      .find({ isPublic: true, status: ProjectStatus.PUBLISHED })
      .sort({ updatedAt: -1 })
      .limit(50)
      .exec();
  }

  async updateStatus(id: string, status: ProjectStatus, user: UserDocument): Promise<Project> {
    return this.update(id, { status }, user);
  }

  async addImageToProject(projectId: string, imageId: string, user: UserDocument): Promise<ProjectDocument> {
    const project = await this.findById(projectId, user);

    if (project.userId.toString() !== (user._id as any).toString()) {
      throw new ForbiddenException('You can only modify your own projects');
    }

    if (!project.images.includes(imageId)) {
      project.images.push(imageId);
      return project.save();
    }

    return project;
  }

  async removeImageFromProject(projectId: string, imageId: string, user: UserDocument): Promise<ProjectDocument> {
    const project = await this.findById(projectId, user);

    if (project.userId.toString() !== (user._id as any).toString()) {
      throw new ForbiddenException('You can only modify your own projects');
    }

    project.images = project.images.filter(id => id !== imageId);
    return project.save();
  }
}
