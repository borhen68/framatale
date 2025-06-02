import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectStatus } from './schemas/project.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: UserDocument,
  ): Promise<Project> {
    return this.projectService.create(createProjectDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user projects' })
  @ApiQuery({ name: 'status', enum: ProjectStatus, required: false })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async findAll(
    @CurrentUser() user: UserDocument,
    @Query('status') status?: ProjectStatus,
  ): Promise<Project[]> {
    if (status) {
      return this.projectService.findByStatus(status, user);
    }
    return this.projectService.findAll(user);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public projects' })
  @ApiResponse({ status: 200, description: 'Public projects retrieved successfully' })
  async findPublicProjects(): Promise<Project[]> {
    return this.projectService.findPublicProjects();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Project> {
    return this.projectService.findById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: UserDocument,
  ): Promise<Project> {
    return this.projectService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    await this.projectService.delete(id, user);
    return { message: 'Project deleted successfully' };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({ status: 200, description: 'Project status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
    @CurrentUser() user: UserDocument,
  ): Promise<Project> {
    return this.projectService.updateStatus(id, status, user);
  }

  @Put(':id/images/:imageId')
  @ApiOperation({ summary: 'Add image to project' })
  @ApiResponse({ status: 200, description: 'Image added to project successfully' })
  async addImage(
    @Param('id') projectId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Project> {
    return this.projectService.addImageToProject(projectId, imageId, user);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Remove image from project' })
  @ApiResponse({ status: 200, description: 'Image removed from project successfully' })
  async removeImage(
    @Param('id') projectId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Project> {
    return this.projectService.removeImageFromProject(projectId, imageId, user);
  }
}
