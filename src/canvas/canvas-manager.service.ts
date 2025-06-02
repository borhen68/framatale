import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Canvas, CanvasDocument, ProductType, CanvasType, ElementType } from './schemas/canvas.schema';
import { Template, TemplateDocument } from './schemas/template.schema';

export interface CreateCanvasRequest {
  projectId: string;
  productType: ProductType;
  canvasType: CanvasType;
  name: string;
  dimensions: {
    width: number;
    height: number;
    unit?: string;
    dpi?: number;
    orientation?: 'portrait' | 'landscape';
  };
  templateId?: string;
}

export interface AddElementRequest {
  canvasId: string;
  element: {
    type: ElementType;
    name: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    image?: { url: string };
    text?: { content: string; fontSize?: number; color?: string };
    shape?: { type: string; fill?: string };
  };
}

@Injectable()
export class CanvasManagerService {
  constructor(
    @InjectModel(Canvas.name) private canvasModel: Model<CanvasDocument>,
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {}

  // Create a new canvas
  async createCanvas(request: CreateCanvasRequest): Promise<Canvas> {
    // Get the next order number for this project
    const lastCanvas = await this.canvasModel
      .findOne({ projectId: new Types.ObjectId(request.projectId) })
      .sort({ order: -1 })
      .exec();

    const order = lastCanvas ? lastCanvas.order + 1 : 1;

    // Create canvas with default settings
    const canvas = new this.canvasModel({
      projectId: new Types.ObjectId(request.projectId),
      productType: request.productType,
      canvasType: request.canvasType,
      name: request.name,
      order,
      dimensions: {
        width: request.dimensions.width,
        height: request.dimensions.height,
        unit: request.dimensions.unit || 'px',
        dpi: request.dimensions.dpi || 300,
        bleed: 3, // 3mm bleed for print
        safeZone: 5, // 5mm safe zone
        orientation: request.dimensions.orientation || 'portrait',
      },
      background: {
        type: 'color',
        color: '#ffffff',
      },
      elements: [],
      metadata: {
        isTemplate: false,
        tags: [],
        version: 1,
        printReady: false,
      },
    });

    // If template is specified, apply it
    if (request.templateId) {
      await this.applyTemplate(canvas, request.templateId);
    }

    return canvas.save();
  }

  // Create photo book with multiple canvases
  async createPhotoBook(
    projectId: string,
    dimensions: { width: number; height: number },
    pageCount: number = 20,
    templateId?: string,
  ): Promise<Canvas[]> {
    const canvases: Canvas[] = [];

    // Create front cover
    const frontCover = await this.createCanvas({
      projectId,
      productType: ProductType.PHOTO_BOOK,
      canvasType: CanvasType.COVER,
      name: 'Front Cover',
      dimensions,
      templateId: templateId ? `${templateId}_cover` : undefined,
    });
    canvases.push(frontCover);

    // Create interior pages (spreads)
    const spreadCount = Math.ceil(pageCount / 2);
    for (let i = 1; i <= spreadCount; i++) {
      const spread = await this.createCanvas({
        projectId,
        productType: ProductType.PHOTO_BOOK,
        canvasType: CanvasType.SPREAD,
        name: `Pages ${i * 2 - 1}-${i * 2}`,
        dimensions: {
          width: dimensions.width * 2, // Double width for spread
          height: dimensions.height,
        },
        templateId: templateId ? `${templateId}_spread_${i}` : undefined,
      });
      canvases.push(spread);
    }

    // Create back cover
    const backCover = await this.createCanvas({
      projectId,
      productType: ProductType.PHOTO_BOOK,
      canvasType: CanvasType.COVER,
      name: 'Back Cover',
      dimensions,
      templateId: templateId ? `${templateId}_back` : undefined,
    });
    canvases.push(backCover);

    return canvases;
  }

  // Create calendar with 12 months
  async createCalendar(
    projectId: string,
    dimensions: { width: number; height: number },
    year: number,
    templateId?: string,
  ): Promise<Canvas[]> {
    const canvases: Canvas[] = [];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Create cover
    const cover = await this.createCanvas({
      projectId,
      productType: ProductType.CALENDAR,
      canvasType: CanvasType.COVER,
      name: `${year} Calendar Cover`,
      dimensions,
      templateId: templateId ? `${templateId}_cover` : undefined,
    });
    canvases.push(cover);

    // Create month pages
    for (let i = 0; i < 12; i++) {
      const monthCanvas = await this.createCanvas({
        projectId,
        productType: ProductType.CALENDAR,
        canvasType: CanvasType.MONTH,
        name: `${months[i]} ${year}`,
        dimensions,
        templateId: templateId ? `${templateId}_month` : undefined,
      });

      // Add calendar grid for the month
      await this.addCalendarGrid(monthCanvas._id.toString(), year, i + 1);
      canvases.push(monthCanvas);
    }

    return canvases;
  }

  // Add extra page/canvas to existing project
  async addExtraCanvas(
    projectId: string,
    insertAfter: number,
    canvasType: CanvasType = CanvasType.PAGE,
  ): Promise<Canvas> {
    // Get project canvases to determine dimensions and product type
    const existingCanvases = await this.canvasModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ order: 1 })
      .exec();

    if (existingCanvases.length === 0) {
      throw new NotFoundException('No existing canvases found for project');
    }

    const referenceCanvas = existingCanvases[0];
    
    // Shift order of subsequent canvases
    await this.canvasModel
      .updateMany(
        { 
          projectId: new Types.ObjectId(projectId),
          order: { $gt: insertAfter }
        },
        { $inc: { order: 1 } }
      )
      .exec();

    // Create new canvas
    const newCanvas = await this.createCanvas({
      projectId,
      productType: referenceCanvas.productType,
      canvasType,
      name: `Page ${insertAfter + 1}`,
      dimensions: {
        width: referenceCanvas.dimensions.width,
        height: referenceCanvas.dimensions.height,
        unit: referenceCanvas.dimensions.unit,
        dpi: referenceCanvas.dimensions.dpi,
        orientation: referenceCanvas.dimensions.orientation,
      },
    });

    // Update the order to the correct position
    const canvasDoc = await this.canvasModel.findById(newCanvas._id).exec();
    if (canvasDoc) {
      canvasDoc.order = insertAfter + 1;
      await canvasDoc.save();
      return canvasDoc;
    }

    return newCanvas;
  }

  // Apply template to canvas
  async applyTemplate(canvas: Canvas | CanvasDocument, templateId: string): Promise<void> {
    const template = await this.templateModel.findById(templateId).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Find matching canvas in template
    const templateCanvas = template.canvases.find(tc => 
      tc.canvasType === canvas.canvasType || 
      (template.canvases.length === 1 && template.canvases[0])
    );

    if (!templateCanvas) {
      throw new BadRequestException('Template does not have matching canvas type');
    }

    // Apply template background
    if (templateCanvas.background) {
      canvas.background = templateCanvas.background;
    }

    // Apply template elements
    canvas.elements = templateCanvas.elements.map(element => ({
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type: element.type as ElementType,
    })) as any;

    // Set template metadata
    canvas.template = {
      templateId: template._id,
      templateName: template.name,
      templateCategory: template.category,
      appliedAt: new Date(),
      customizations: [],
    };
  }

  // Add element to canvas
  async addElement(request: AddElementRequest): Promise<Canvas> {
    const canvas = await this.canvasModel.findById(request.canvasId).exec();
    if (!canvas) {
      throw new NotFoundException('Canvas not found');
    }

    const elementId = `element_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const newElement = {
      id: elementId,
      type: request.element.type,
      name: request.element.name,
      position: { 
        x: request.element.position.x, 
        y: request.element.position.y, 
        z: canvas.elements.length 
      },
      size: request.element.size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
    };

    // Add type-specific properties
    switch (request.element.type) {
      case ElementType.IMAGE:
        if (request.element.image) {
          newElement['image'] = {
            url: request.element.image.url,
            originalUrl: request.element.image.url,
            filters: {
              brightness: 100,
              contrast: 100,
              saturation: 100,
              blur: 0,
              sepia: 0,
            },
          };
        }
        break;

      case ElementType.TEXT:
        newElement['text'] = {
          content: request.element.text?.content || 'Sample Text',
          fontFamily: 'Arial',
          fontSize: request.element.text?.fontSize || 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: request.element.text?.color || '#000000',
          align: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
        };
        break;

      case ElementType.SHAPE:
        newElement['shape'] = {
          type: request.element.shape?.type || 'rectangle',
          fill: request.element.shape?.fill || '#000000',
          stroke: {
            color: '#000000',
            width: 0,
            style: 'solid',
          },
          cornerRadius: 0,
        };
        break;
    }

    canvas.elements.push(newElement as any);
    canvas.metadata!.version += 1;

    return canvas.save();
  }

  // Get project canvases
  async getProjectCanvases(projectId: string): Promise<Canvas[]> {
    return this.canvasModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ order: 1 })
      .exec();
  }

  // Update canvas element
  async updateElement(
    canvasId: string,
    elementId: string,
    updates: any,
  ): Promise<Canvas> {
    const canvas = await this.canvasModel.findById(canvasId).exec();
    if (!canvas) {
      throw new NotFoundException('Canvas not found');
    }

    const elementIndex = canvas.elements.findIndex(e => e.id === elementId);
    if (elementIndex === -1) {
      throw new NotFoundException('Element not found');
    }

    // Update element properties
    Object.assign(canvas.elements[elementIndex], updates);
    canvas.metadata!.version += 1;

    // Track customizations if canvas is from template
    if (canvas.template) {
      const customization = `element_${elementId}_updated`;
      if (!canvas.template.customizations.includes(customization)) {
        canvas.template.customizations.push(customization);
      }
    }

    return canvas.save();
  }

  // Delete canvas element
  async deleteElement(canvasId: string, elementId: string): Promise<Canvas> {
    const canvas = await this.canvasModel.findById(canvasId).exec();
    if (!canvas) {
      throw new NotFoundException('Canvas not found');
    }

    canvas.elements = canvas.elements.filter(e => e.id !== elementId);
    canvas.metadata!.version += 1;

    return canvas.save();
  }

  // Private helper methods
  private async addCalendarGrid(canvasId: string, _year: number, month: number): Promise<void> {
    // This would add a calendar grid for the specified month
    // Implementation would create grid elements with dates
    const canvas = await this.canvasModel.findById(canvasId).exec();
    if (!canvas) return;

    // Add calendar grid elements (simplified)
    const gridElement = {
      id: `calendar_grid_${month}`,
      type: ElementType.SHAPE,
      name: 'Calendar Grid',
      position: { x: 50, y: 200, z: 0 },
      size: { width: canvas.dimensions.width - 100, height: 300 },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      shape: {
        type: 'rectangle',
        fill: 'transparent',
        stroke: {
          color: '#cccccc',
          width: 1,
          style: 'solid',
        },
        cornerRadius: 0,
      },
    };

    canvas.elements.push(gridElement as any);
    await canvas.save();
  }
}
