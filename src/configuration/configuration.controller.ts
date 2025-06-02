import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConfigurationService, CreateConfigurationRequest, GetConfigurationOptions } from './configuration.service';
import { Configuration, ConfigurationType } from './schemas/configuration.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDocument, UserRole } from '../user/schemas/user.schema';

@ApiTags('Configuration')
@Controller('configuration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConfigurationController {
  constructor(private configurationService: ConfigurationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new configuration (Admin only)' })
  @ApiResponse({ status: 201, description: 'Configuration created successfully' })
  async createConfiguration(@Body() request: CreateConfigurationRequest): Promise<Configuration> {
    return this.configurationService.createConfiguration(request);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all configurations (Admin only)' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiQuery({ name: 'includeInactive', type: 'boolean', required: false })
  @ApiResponse({ status: 200, description: 'Configurations retrieved successfully' })
  async getAllConfigurations(
    @Query('environment') environment?: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<Configuration[]> {
    return this.configurationService.getAllConfigurations({
      environment,
      includeInactive,
    });
  }

  @Get('category/:category')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get configurations by category (Admin only)' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Configurations retrieved successfully' })
  async getConfigurationsByCategory(
    @Param('category') category: string,
    @Query('environment') environment?: string,
  ): Promise<Configuration[]> {
    return this.configurationService.getConfigurationsByCategory(category, { environment });
  }

  @Get('feature/:featureName')
  @ApiOperation({ summary: 'Check if feature is enabled' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Feature status retrieved successfully' })
  async isFeatureEnabled(
    @Param('featureName') featureName: string,
    @Query('environment') environment?: string,
    @CurrentUser() user?: UserDocument,
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.configurationService.isFeatureEnabled(featureName, {
      environment,
      userId: user ? (user._id as any).toString() : undefined,
    });
    return { enabled };
  }

  @Get('ab-test/:testName')
  @ApiOperation({ summary: 'Get A/B test variant' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'A/B test variant retrieved successfully' })
  async getABTestVariant(
    @Param('testName') testName: string,
    @Query('environment') environment?: string,
    @CurrentUser() user?: UserDocument,
  ): Promise<{ variant: string | null }> {
    const variant = await this.configurationService.getABTestVariant(testName, {
      environment,
      userId: user ? (user._id as any).toString() : undefined,
    });
    return { variant };
  }

  @Get('user')
  @ApiOperation({ summary: 'Get user-specific configurations' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'User configurations retrieved successfully' })
  async getUserConfigurations(
    @Query('environment') environment?: string,
    @CurrentUser() user?: UserDocument,
  ): Promise<Configuration[]> {
    return this.configurationService.getAllConfigurations({
      environment,
      userId: user ? (user._id as any).toString() : undefined,
    });
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get configuration by key' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiQuery({ name: 'default', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Configuration retrieved successfully' })
  async getConfiguration(
    @Param('key') key: string,
    @Query('environment') environment?: string,
    @Query('default') defaultValue?: any,
    @CurrentUser() user?: UserDocument,
  ): Promise<{ value: any }> {
    const options: GetConfigurationOptions = {
      environment,
      userId: user ? (user._id as any).toString() : undefined,
    };

    const value = defaultValue !== undefined
      ? await this.configurationService.getConfigurationWithDefault(key, defaultValue, options)
      : await this.configurationService.getConfiguration(key, options);

    return { value };
  }

  @Put(':key')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update configuration (Admin only)' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  async updateConfiguration(
    @Param('key') key: string,
    @Body() updates: Partial<Configuration>,
    @Query('environment') environment?: string,
  ): Promise<Configuration> {
    return this.configurationService.updateConfiguration(key, updates, { environment });
  }

  @Delete(':key')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete configuration (Admin only)' })
  @ApiQuery({ name: 'environment', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Configuration deleted successfully' })
  async deleteConfiguration(
    @Param('key') key: string,
    @Query('environment') environment?: string,
  ): Promise<{ message: string }> {
    await this.configurationService.deleteConfiguration(key, { environment });
    return { message: 'Configuration deleted successfully' };
  }

  @Post('bulk-update')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk update configurations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Configurations updated successfully' })
  async bulkUpdateConfigurations(
    @Body() updates: Array<{ key: string; value: any; options?: GetConfigurationOptions }>,
  ): Promise<{ updated: number; errors: string[] }> {
    return this.configurationService.bulkUpdateConfigurations(updates);
  }
}
