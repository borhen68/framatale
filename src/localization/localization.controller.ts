import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LocalizationService, CreateTranslationRequest, LocalizationOptions } from './localization.service';
import { Translation } from './schemas/translation.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@ApiTags('Localization')
@Controller('localization')
export class LocalizationController {
  constructor(private localizationService: LocalizationService) {}

  @Post('translations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new translation (Admin only)' })
  @ApiResponse({ status: 201, description: 'Translation created successfully' })
  async createTranslation(@Body() request: CreateTranslationRequest): Promise<Translation> {
    return this.localizationService.createTranslation(request);
  }

  @Get('translate/:key')
  @ApiOperation({ summary: 'Get translation for a key' })
  @ApiQuery({ name: 'language', type: 'string' })
  @ApiQuery({ name: 'namespace', type: 'string', required: false })
  @ApiQuery({ name: 'count', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Translation retrieved successfully' })
  async translate(
    @Param('key') key: string,
    @Query('language') language: string,
    @Query('namespace') namespace?: string,
    @Query('count') count?: number,
  ): Promise<{ translation: string }> {
    const options: LocalizationOptions = {
      language,
      namespace,
      count: count ? parseInt(count.toString()) : undefined,
    };
    
    const translation = await this.localizationService.translate(key, options);
    return { translation };
  }

  @Get('translations/:language')
  @ApiOperation({ summary: 'Get all translations for a language' })
  @ApiQuery({ name: 'namespace', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Translations retrieved successfully' })
  async getTranslations(
    @Param('language') language: string,
    @Query('namespace') namespace?: string,
  ): Promise<Record<string, any>> {
    return this.localizationService.getTranslations(language, namespace);
  }

  @Get('languages')
  @ApiOperation({ summary: 'Get supported languages' })
  @ApiResponse({ status: 200, description: 'Supported languages retrieved successfully' })
  async getSupportedLanguages(): Promise<{ languages: string[] }> {
    const languages = await this.localizationService.getSupportedLanguages();
    return { languages };
  }

  @Get('namespaces')
  @ApiOperation({ summary: 'Get available namespaces' })
  @ApiResponse({ status: 200, description: 'Namespaces retrieved successfully' })
  async getNamespaces(): Promise<{ namespaces: string[] }> {
    const namespaces = await this.localizationService.getNamespaces();
    return { namespaces };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get translation statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getTranslationStats(): Promise<any> {
    return this.localizationService.getTranslationStats();
  }

  @Get('missing/:targetLanguage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get missing translations (Admin only)' })
  @ApiQuery({ name: 'sourceLanguage', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Missing translations retrieved successfully' })
  async getMissingTranslations(
    @Param('targetLanguage') targetLanguage: string,
    @Query('sourceLanguage') sourceLanguage?: string,
  ): Promise<{ missing: string[] }> {
    const missing = await this.localizationService.getMissingTranslations(targetLanguage, sourceLanguage);
    return { missing };
  }

  @Post('import/:language/:namespace')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk import translations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Translations imported successfully' })
  async bulkImportTranslations(
    @Param('language') language: string,
    @Param('namespace') namespace: string,
    @Body() translations: Record<string, string>,
  ): Promise<{ imported: number; updated: number; errors: string[] }> {
    return this.localizationService.bulkImportTranslations(language, namespace, translations);
  }

  @Get('export/:language')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export translations (Admin only)' })
  @ApiQuery({ name: 'namespace', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Translations exported successfully' })
  async exportTranslations(
    @Param('language') language: string,
    @Query('namespace') namespace?: string,
  ): Promise<Record<string, string>> {
    return this.localizationService.exportTranslations(language, namespace);
  }
}
