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
import { 
  CanvasManagerService, 
  CreateCanvasRequest, 
  AddElementRequest 
} from './canvas-manager.service';
import { Canvas, ProductType, CanvasType } from './schemas/canvas.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Canvas Management')
@Controller('canvas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CanvasController {
  constructor(private canvasManager: CanvasManagerService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new canvas' })
  @ApiResponse({ status: 201, description: 'Canvas created successfully' })
  async createCanvas(@Body() request: CreateCanvasRequest): Promise<Canvas> {
    return this.canvasManager.createCanvas(request);
  }

  @Post('photo-book')
  @ApiOperation({ summary: 'Create photo book with multiple canvases' })
  @ApiResponse({ status: 201, description: 'Photo book canvases created successfully' })
  async createPhotoBook(
    @Body() request: {
      projectId: string;
      dimensions: { width: number; height: number };
      pageCount?: number;
      templateId?: string;
    },
  ): Promise<Canvas[]> {
    return this.canvasManager.createPhotoBook(
      request.projectId,
      request.dimensions,
      request.pageCount || 20,
      request.templateId,
    );
  }

  @Post('calendar')
  @ApiOperation({ summary: 'Create calendar with 12 month canvases' })
  @ApiResponse({ status: 201, description: 'Calendar canvases created successfully' })
  async createCalendar(
    @Body() request: {
      projectId: string;
      dimensions: { width: number; height: number };
      year: number;
      templateId?: string;
    },
  ): Promise<Canvas[]> {
    return this.canvasManager.createCalendar(
      request.projectId,
      request.dimensions,
      request.year,
      request.templateId,
    );
  }

  @Post('add-extra')
  @ApiOperation({ summary: 'Add extra canvas/page to project' })
  @ApiResponse({ status: 201, description: 'Extra canvas added successfully' })
  async addExtraCanvas(
    @Body() request: {
      projectId: string;
      insertAfter: number;
      canvasType?: CanvasType;
    },
  ): Promise<Canvas> {
    return this.canvasManager.addExtraCanvas(
      request.projectId,
      request.insertAfter,
      request.canvasType,
    );
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all canvases for a project' })
  @ApiResponse({ status: 200, description: 'Project canvases retrieved successfully' })
  async getProjectCanvases(@Param('projectId') projectId: string): Promise<Canvas[]> {
    return this.canvasManager.getProjectCanvases(projectId);
  }

  @Post(':canvasId/elements')
  @ApiOperation({ summary: 'Add element to canvas' })
  @ApiResponse({ status: 201, description: 'Element added successfully' })
  async addElement(
    @Param('canvasId') canvasId: string,
    @Body() element: AddElementRequest['element'],
  ): Promise<Canvas> {
    return this.canvasManager.addElement({ canvasId, element });
  }

  @Put(':canvasId/elements/:elementId')
  @ApiOperation({ summary: 'Update canvas element' })
  @ApiResponse({ status: 200, description: 'Element updated successfully' })
  async updateElement(
    @Param('canvasId') canvasId: string,
    @Param('elementId') elementId: string,
    @Body() updates: any,
  ): Promise<Canvas> {
    return this.canvasManager.updateElement(canvasId, elementId, updates);
  }

  @Delete(':canvasId/elements/:elementId')
  @ApiOperation({ summary: 'Delete canvas element' })
  @ApiResponse({ status: 200, description: 'Element deleted successfully' })
  async deleteElement(
    @Param('canvasId') canvasId: string,
    @Param('elementId') elementId: string,
  ): Promise<Canvas> {
    return this.canvasManager.deleteElement(canvasId, elementId);
  }

  // Example endpoints for testing
  @Post('examples/8x8-photo-book')
  @ApiOperation({ summary: 'Example: Create 8x8 photo book' })
  @ApiResponse({ status: 201, description: '8x8 photo book created successfully' })
  async create8x8PhotoBook(
    @Body() request: { projectId: string; templateId?: string },
  ): Promise<{
    message: string;
    canvases: Canvas[];
    details: {
      productType: string;
      size: string;
      pageCount: number;
      canvasCount: number;
      dimensions: any;
    };
  }> {
    const dimensions = { width: 2400, height: 2400 }; // 8x8 inches at 300 DPI
    const canvases = await this.canvasManager.createPhotoBook(
      request.projectId,
      dimensions,
      20,
      request.templateId,
    );

    return {
      message: '8x8 photo book created successfully',
      canvases,
      details: {
        productType: 'PHOTO_BOOK',
        size: '8x8',
        pageCount: 20,
        canvasCount: canvases.length,
        dimensions: {
          cover: dimensions,
          spread: { width: 4800, height: 2400 },
          dpi: 300,
          unit: 'px',
        },
      },
    };
  }

  @Post('examples/add-5-pages')
  @ApiOperation({ summary: 'Example: Add 5 extra pages to photo book' })
  @ApiResponse({ status: 201, description: 'Extra pages added successfully' })
  async addFiveExtraPages(
    @Body() request: { projectId: string },
  ): Promise<{
    message: string;
    addedCanvases: Canvas[];
    pricingUpdate: {
      extraPages: number;
      costPerPage: number;
      totalExtraCost: number;
      newTotalPrice: number;
    };
  }> {
    const addedCanvases: Canvas[] = [];
    
    // Add 5 extra pages
    for (let i = 1; i <= 5; i++) {
      const canvas = await this.canvasManager.addExtraCanvas(
        request.projectId,
        20 + i - 1, // Insert after existing pages
        CanvasType.SPREAD,
      );
      addedCanvases.push(canvas);
    }

    return {
      message: '5 extra pages added successfully',
      addedCanvases,
      pricingUpdate: {
        extraPages: 5,
        costPerPage: 1.00,
        totalExtraCost: 5.00,
        newTotalPrice: 27.00, // $22 base + $5 extra
      },
    };
  }

  @Get('examples/size-guide')
  @ApiOperation({ summary: 'Get canvas size guide for different products' })
  @ApiResponse({ status: 200, description: 'Size guide retrieved successfully' })
  async getSizeGuide(): Promise<{
    photoBooks: any;
    calendars: any;
    cards: any;
    examples: string[];
  }> {
    return {
      photoBooks: {
        '8x8': {
          cover: { width: 2400, height: 2400 },
          spread: { width: 4800, height: 2400 },
          dpi: 300,
          unit: 'px',
        },
        '12x12': {
          cover: { width: 3600, height: 3600 },
          spread: { width: 7200, height: 3600 },
          dpi: 300,
          unit: 'px',
        },
        '8x11': {
          cover: { width: 2400, height: 3300 },
          spread: { width: 4800, height: 3300 },
          dpi: 300,
          unit: 'px',
        },
      },
      calendars: {
        '11x8.5': {
          dimensions: { width: 3300, height: 2550 },
          orientation: 'landscape',
          dpi: 300,
        },
        '12x12': {
          dimensions: { width: 3600, height: 3600 },
          orientation: 'portrait',
          dpi: 300,
        },
      },
      cards: {
        '5x7': {
          dimensions: { width: 1500, height: 2100 },
          orientation: 'portrait',
          dpi: 300,
        },
        '4x6': {
          dimensions: { width: 1200, height: 1800 },
          orientation: 'portrait',
          dpi: 300,
        },
      },
      examples: [
        'All dimensions are in pixels at 300 DPI for print quality',
        'Photo book spreads are double-width for two-page layouts',
        'Bleed zones (3mm) and safe zones (5mm) are automatically added',
        'Templates are size-specific and will only show for matching dimensions',
      ],
    };
  }
}
