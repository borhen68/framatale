import { Model } from 'mongoose';
import { Canvas, CanvasDocument, ProductType, CanvasType, ElementType } from './schemas/canvas.schema';
import { TemplateDocument } from './schemas/template.schema';
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
        position: {
            x: number;
            y: number;
        };
        size: {
            width: number;
            height: number;
        };
        image?: {
            url: string;
        };
        text?: {
            content: string;
            fontSize?: number;
            color?: string;
        };
        shape?: {
            type: string;
            fill?: string;
        };
    };
}
export declare class CanvasManagerService {
    private canvasModel;
    private templateModel;
    constructor(canvasModel: Model<CanvasDocument>, templateModel: Model<TemplateDocument>);
    createCanvas(request: CreateCanvasRequest): Promise<Canvas>;
    createPhotoBook(projectId: string, dimensions: {
        width: number;
        height: number;
    }, pageCount?: number, templateId?: string): Promise<Canvas[]>;
    createCalendar(projectId: string, dimensions: {
        width: number;
        height: number;
    }, year: number, templateId?: string): Promise<Canvas[]>;
    addExtraCanvas(projectId: string, insertAfter: number, canvasType?: CanvasType): Promise<Canvas>;
    applyTemplate(canvas: Canvas | CanvasDocument, templateId: string): Promise<void>;
    addElement(request: AddElementRequest): Promise<Canvas>;
    getProjectCanvases(projectId: string): Promise<Canvas[]>;
    updateElement(canvasId: string, elementId: string, updates: any): Promise<Canvas>;
    deleteElement(canvasId: string, elementId: string): Promise<Canvas>;
    private addCalendarGrid;
}
