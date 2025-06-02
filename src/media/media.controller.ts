import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Media } from './schemas/media.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        altText: {
          type: 'string',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
        isPublic: {
          type: 'boolean',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadMediaDto,
    @CurrentUser() user: UserDocument,
  ): Promise<Media> {
    return this.mediaService.uploadFile(file, uploadDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user media files' })
  @ApiResponse({ status: 200, description: 'Media files retrieved successfully' })
  async findAll(
    @CurrentUser() user: UserDocument,
    @Query('tags') tags?: string,
  ): Promise<Media[]> {
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      return this.mediaService.findByTags(tagArray, user);
    }
    return this.mediaService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media file by ID' })
  @ApiResponse({ status: 200, description: 'Media file retrieved successfully' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Media> {
    return this.mediaService.findById(id, user);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download media file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, media } = await this.mediaService.getFileStream(id, user);
    
    res.set({
      'Content-Type': media.mimeType,
      'Content-Disposition': `attachment; filename="${media.originalName}"`,
      'Content-Length': media.size.toString(),
    });
    
    res.send(stream);
  }

  @Get(':id/thumbnail')
  @ApiOperation({ summary: 'Get media thumbnail' })
  @ApiResponse({ status: 200, description: 'Thumbnail retrieved successfully' })
  async getThumbnail(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    const { stream } = await this.mediaService.getThumbnail(id, user);
    
    res.set({
      'Content-Type': 'image/jpeg',
    });
    
    res.send(stream);
  }

  @Put(':id/tags')
  @ApiOperation({ summary: 'Update media tags' })
  @ApiResponse({ status: 200, description: 'Tags updated successfully' })
  async updateTags(
    @Param('id') id: string,
    @Body('tags') tags: string[],
    @CurrentUser() user: UserDocument,
  ): Promise<Media> {
    return this.mediaService.updateTags(id, tags, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    await this.mediaService.delete(id, user);
    return { message: 'File deleted successfully' };
  }
}
