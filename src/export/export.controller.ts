import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService, ExportRequest } from './export.service';
import { ExportJob } from './schemas/export-job.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post()
  @ApiOperation({ summary: 'Create an export job' })
  @ApiResponse({ status: 201, description: 'Export job created successfully' })
  async createExport(
    @Body() request: ExportRequest,
    @CurrentUser() user: UserDocument,
  ): Promise<ExportJob> {
    return this.exportService.createExportJob(request, user);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all user export jobs' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  async getUserJobs(@CurrentUser() user: UserDocument): Promise<ExportJob[]> {
    return this.exportService.getUserJobs(user);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get export job status' })
  @ApiResponse({ status: 200, description: 'Job status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(
    @Param('jobId') jobId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<ExportJob> {
    return this.exportService.getJobStatus(jobId, user);
  }

  @Get('download/:jobId')
  @ApiOperation({ summary: 'Download exported file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadExport(
    @Param('jobId') jobId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, filename, mimeType } = await this.exportService.downloadExport(jobId, user);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': stream.length.toString(),
    });
    
    res.send(stream);
  }
}
