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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_schema_1 = require("./schemas/project.schema");
let ProjectService = class ProjectService {
    projectModel;
    constructor(projectModel) {
        this.projectModel = projectModel;
    }
    async create(createProjectDto, user) {
        const project = new this.projectModel({
            ...createProjectDto,
            userId: user._id,
            pages: [],
            images: createProjectDto.images || [],
            totalPages: createProjectDto.totalPages || 1,
            status: project_schema_1.ProjectStatus.DRAFT,
        });
        return project.save();
    }
    async findAll(user) {
        return this.projectModel
            .find({ userId: user._id })
            .sort({ updatedAt: -1 })
            .exec();
    }
    async findById(id, user) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.NotFoundException('Invalid project ID');
        }
        const project = await this.projectModel.findById(id).exec();
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.userId.toString() !== user._id.toString() && !project.isPublic) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return project;
    }
    async update(id, updateProjectDto, user) {
        const project = await this.findById(id, user);
        if (project.userId.toString() !== user._id.toString()) {
            throw new common_1.ForbiddenException('You can only update your own projects');
        }
        const updatedProject = await this.projectModel
            .findByIdAndUpdate(id, updateProjectDto, { new: true })
            .exec();
        if (!updatedProject) {
            throw new common_1.NotFoundException('Project not found');
        }
        return updatedProject;
    }
    async delete(id, user) {
        const project = await this.findById(id, user);
        if (project.userId.toString() !== user._id.toString()) {
            throw new common_1.ForbiddenException('You can only delete your own projects');
        }
        await this.projectModel.findByIdAndDelete(id).exec();
    }
    async findByStatus(status, user) {
        return this.projectModel
            .find({ userId: user._id, status })
            .sort({ updatedAt: -1 })
            .exec();
    }
    async findPublicProjects() {
        return this.projectModel
            .find({ isPublic: true, status: project_schema_1.ProjectStatus.PUBLISHED })
            .sort({ updatedAt: -1 })
            .limit(50)
            .exec();
    }
    async updateStatus(id, status, user) {
        return this.update(id, { status }, user);
    }
    async addImageToProject(projectId, imageId, user) {
        const project = await this.findById(projectId, user);
        if (project.userId.toString() !== user._id.toString()) {
            throw new common_1.ForbiddenException('You can only modify your own projects');
        }
        if (!project.images.includes(imageId)) {
            project.images.push(imageId);
            return project.save();
        }
        return project;
    }
    async removeImageFromProject(projectId, imageId, user) {
        const project = await this.findById(projectId, user);
        if (project.userId.toString() !== user._id.toString()) {
            throw new common_1.ForbiddenException('You can only modify your own projects');
        }
        project.images = project.images.filter(id => id !== imageId);
        return project.save();
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProjectService);
//# sourceMappingURL=project.service.js.map