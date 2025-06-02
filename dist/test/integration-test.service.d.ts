import { CanvasManagerService } from '../canvas/canvas-manager.service';
import { TemplateManagerService } from '../canvas/template-manager.service';
import { PrintOnDemandPricingService } from '../pricing/print-on-demand-pricing.service';
import { DynamicCustomizationPricingService } from '../pricing/dynamic-customization-pricing.service';
export declare class IntegrationTestService {
    private canvasManager;
    private templateManager;
    private podPricing;
    private customizationPricing;
    private readonly logger;
    constructor(canvasManager: CanvasManagerService, templateManager: TemplateManagerService, podPricing: PrintOnDemandPricingService, customizationPricing: DynamicCustomizationPricingService);
    runCompleteSystemTest(): Promise<{
        success: boolean;
        results: any[];
        errors: string[];
        summary: {
            totalTests: number;
            passed: number;
            failed: number;
            executionTime: number;
        };
    }>;
    private testPrintOnDemandPricing;
    private testCustomizationPricing;
    private testTemplateSystem;
    private testCanvasManagement;
    private testCompleteWorkflow;
}
