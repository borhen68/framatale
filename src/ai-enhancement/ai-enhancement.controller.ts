import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIEnhancementService, EnhancementRequest } from './ai-enhancement.service';
import { EnhancementJob } from './schemas/enhancement-job.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('AI Enhancement')
@Controller('ai-enhancement')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIEnhancementController {
  constructor(private enhancementService: AIEnhancementService) {}

  @Post('enhance')
  @ApiOperation({ summary: 'Create an AI enhancement job' })
  @ApiResponse({ status: 201, description: 'Enhancement job created successfully' })
  async createEnhancement(
    @Body() request: EnhancementRequest,
    @CurrentUser() user: UserDocument,
  ): Promise<EnhancementJob> {
    return this.enhancementService.createEnhancementJob(request, user);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all user enhancement jobs' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  async getUserJobs(@CurrentUser() user: UserDocument): Promise<EnhancementJob[]> {
    return this.enhancementService.getUserJobs(user);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get enhancement job status' })
  @ApiResponse({ status: 200, description: 'Job status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(
    @Param('jobId') jobId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<EnhancementJob> {
    return this.enhancementService.getJobStatus(jobId, user);
  }

  @Delete('jobs/:jobId')
  @ApiOperation({ summary: 'Cancel enhancement job' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async cancelJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    await this.enhancementService.cancelJob(jobId, user);
    return { message: 'Job cancelled successfully' };
  }
}
