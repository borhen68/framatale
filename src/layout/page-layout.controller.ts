import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PageLayoutService, AutoLayoutOptions, LayoutSuggestion } from './page-layout.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Page Layout')
@Controller('page-layout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PageLayoutController {
  constructor(private pageLayoutService: PageLayoutService) {}

  @Post('auto-generate')
  @ApiOperation({ summary: 'Generate automatic layout suggestions' })
  @ApiResponse({ status: 201, description: 'Layout suggestions generated successfully' })
  async generateAutoLayout(
    @Body() options: AutoLayoutOptions,
    @CurrentUser() user: UserDocument,
  ): Promise<LayoutSuggestion[]> {
    return this.pageLayoutService.generateAutoLayout(options);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply layout to project' })
  @ApiResponse({ status: 200, description: 'Layout applied successfully' })
  async applyLayout(
    @Body() request: {
      projectId: string;
      templateId: string;
      imageIds: string[];
    },
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    await this.pageLayoutService.applyLayoutToProject(
      request.projectId,
      request.templateId,
      request.imageIds,
      (user._id as any).toString(),
    );
    return { message: 'Layout applied successfully' };
  }
}
