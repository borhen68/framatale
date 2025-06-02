import { CanvasManagerService, CreateCanvasRequest, AddElementRequest } from './canvas-manager.service';
import { Canvas, CanvasType } from './schemas/canvas.schema';
export declare class CanvasController {
    private canvasManager;
    constructor(canvasManager: CanvasManagerService);
    createCanvas(request: CreateCanvasRequest): Promise<Canvas>;
    createPhotoBook(request: {
        projectId: string;
        dimensions: {
            width: number;
            height: number;
        };
        pageCount?: number;
        templateId?: string;
    }): Promise<Canvas[]>;
    createCalendar(request: {
        projectId: string;
        dimensions: {
            width: number;
            height: number;
        };
        year: number;
        templateId?: string;
    }): Promise<Canvas[]>;
    addExtraCanvas(request: {
        projectId: string;
        insertAfter: number;
        canvasType?: CanvasType;
    }): Promise<Canvas>;
    getProjectCanvases(projectId: string): Promise<Canvas[]>;
    addElement(canvasId: string, element: AddElementRequest['element']): Promise<Canvas>;
    updateElement(canvasId: string, elementId: string, updates: any): Promise<Canvas>;
    deleteElement(canvasId: string, elementId: string): Promise<Canvas>;
    create8x8PhotoBook(request: {
        projectId: string;
        templateId?: string;
    }): Promise<{
        message: string;
        canvases: Canvas[];
        details: {
            productType: string;
            size: string;
            pageCount: number;
            canvasCount: number;
            dimensions: any;
        };
    }>;
    addFiveExtraPages(request: {
        projectId: string;
    }): Promise<{
        message: string;
        addedCanvases: Canvas[];
        pricingUpdate: {
            extraPages: number;
            costPerPage: number;
            totalExtraCost: number;
            newTotalPrice: number;
        };
    }>;
    getSizeGuide(): Promise<{
        photoBooks: any;
        calendars: any;
        cards: any;
        examples: string[];
    }>;
}
