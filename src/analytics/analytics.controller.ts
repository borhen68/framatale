import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService, TrackEventRequest, AnalyticsMetrics } from './analytics.service';
import { AnalyticsEvent, EventType, EventCategory } from './schemas/analytics-event.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track an analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(@Body() request: TrackEventRequest): Promise<AnalyticsEvent> {
    return this.analyticsService.trackEvent(request);
  }

  @Get('metrics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get analytics metrics (Admin only)' })
  @ApiQuery({ name: 'startDate', type: 'string', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', type: 'string', description: 'End date (ISO string)' })
  @ApiQuery({ name: 'userId', type: 'string', required: false })
  @ApiQuery({ name: 'eventType', enum: EventType, required: false })
  @ApiQuery({ name: 'category', enum: EventCategory, required: false })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: EventType,
    @Query('category') category?: EventCategory,
  ): Promise<AnalyticsMetrics> {
    return this.analyticsService.getMetrics(
      new Date(startDate),
      new Date(endDate),
      { userId, eventType, category },
    );
  }

  @Get('funnel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get funnel analysis (Admin only)' })
  @ApiQuery({ name: 'steps', type: 'string', description: 'Comma-separated event types' })
  @ApiQuery({ name: 'startDate', type: 'string' })
  @ApiQuery({ name: 'endDate', type: 'string' })
  @ApiResponse({ status: 200, description: 'Funnel analysis retrieved successfully' })
  async getFunnelAnalysis(
    @Query('steps') steps: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Array<{ step: string; users: number; conversionRate: number }>> {
    const funnelSteps = steps.split(',') as EventType[];
    return this.analyticsService.getFunnelAnalysis(
      funnelSteps,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('cohort')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get cohort analysis (Admin only)' })
  @ApiQuery({ name: 'startDate', type: 'string' })
  @ApiQuery({ name: 'endDate', type: 'string' })
  @ApiResponse({ status: 200, description: 'Cohort analysis retrieved successfully' })
  async getCohortAnalysis(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.analyticsService.getCohortAnalysis(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('retention')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get retention analysis (Admin only)' })
  @ApiQuery({ name: 'days', type: 'number', required: false, description: 'Number of days to analyze' })
  @ApiResponse({ status: 200, description: 'Retention analysis retrieved successfully' })
  async getRetentionAnalysis(@Query('days') days?: number): Promise<any> {
    return this.analyticsService.getRetentionAnalysis(days);
  }
}
