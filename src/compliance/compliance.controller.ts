import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ComplianceService, ConsentRequest, DataRequest } from './compliance.service';
import { ComplianceRecord, ComplianceType } from './schemas/compliance-record.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDocument, UserRole } from '../user/schemas/user.schema';

@ApiTags('Compliance')
@Controller('compliance')
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  @Post('consent')
  @ApiOperation({ summary: 'Record user consent' })
  @ApiResponse({ status: 201, description: 'Consent recorded successfully' })
  async recordConsent(@Body() request: ConsentRequest): Promise<ComplianceRecord> {
    return this.complianceService.recordConsent(request);
  }

  @Post('consent/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw user consent' })
  @ApiResponse({ status: 200, description: 'Consent withdrawn successfully' })
  async withdrawConsent(
    @Body('consentType') consentType: ComplianceType,
    @CurrentUser() user: UserDocument,
  ): Promise<ComplianceRecord> {
    return this.complianceService.withdrawConsent((user._id as any).toString(), consentType);
  }

  @Post('data-request')
  @ApiOperation({ summary: 'Submit data request (GDPR/CCPA)' })
  @ApiResponse({ status: 201, description: 'Data request submitted successfully' })
  async submitDataRequest(@Body() request: DataRequest): Promise<ComplianceRecord> {
    return this.complianceService.handleDataRequest(request);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user compliance data (Admin only)' })
  @ApiResponse({ status: 200, description: 'Compliance data retrieved successfully' })
  async getUserComplianceData(@Param('userId') userId: string): Promise<any> {
    return this.complianceService.getUserComplianceData(userId);
  }

  @Get('my-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user compliance data' })
  @ApiResponse({ status: 200, description: 'Compliance data retrieved successfully' })
  async getMyComplianceData(@CurrentUser() user: UserDocument): Promise<any> {
    return this.complianceService.getUserComplianceData((user._id as any).toString());
  }

  @Post('retention/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule data retention (Admin only)' })
  @ApiResponse({ status: 201, description: 'Data retention scheduled successfully' })
  async scheduleDataRetention(
    @Body() request: {
      userId: string;
      retentionPeriod: number;
      retentionUnit: 'days' | 'months' | 'years';
      reason: string;
    },
  ): Promise<ComplianceRecord> {
    return this.complianceService.scheduleDataRetention(
      request.userId,
      request.retentionPeriod,
      request.retentionUnit,
      request.reason,
    );
  }

  @Get('report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get compliance report (Admin only)' })
  @ApiQuery({ name: 'startDate', type: 'string', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', type: 'string', description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Compliance report retrieved successfully' })
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.complianceService.getComplianceReport(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
