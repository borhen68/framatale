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
import { ReportingService, CreateReportRequest } from './reporting.service';
import { Report } from './schemas/report.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDocument, UserRole } from '../user/schemas/user.schema';

@ApiTags('Reporting')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new report (Admin only)' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async createReport(
    @Body() request: CreateReportRequest,
    @CurrentUser() user: UserDocument,
  ): Promise<Report> {
    return this.reportingService.createReport(request, user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all reports (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getReports(@CurrentUser() user: UserDocument): Promise<Report[]> {
    return this.reportingService.getReports(user);
  }

  @Get(':reportId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get report by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getReport(
    @Param('reportId') reportId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Report> {
    return this.reportingService.getReport(reportId, user);
  }

  @Get(':reportId/download')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Download report file (Admin only)' })
  @ApiResponse({ status: 200, description: 'Report downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async downloadReport(
    @Param('reportId') reportId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, filename, mimeType } = await this.reportingService.downloadReport(reportId, user);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': stream.length.toString(),
    });
    
    res.send(stream);
  }
}
