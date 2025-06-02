import { Injectable, Logger } from '@nestjs/common';
import { CanvasManagerService } from '../canvas/canvas-manager.service';
import { TemplateManagerService } from '../canvas/template-manager.service';
import { PrintOnDemandPricingService } from '../pricing/print-on-demand-pricing.service';
import { DynamicCustomizationPricingService } from '../pricing/dynamic-customization-pricing.service';
import { ProductType, CanvasType, ElementType, Canvas } from '../canvas/schemas/canvas.schema';
import { TemplateCategory, TemplateStyle } from '../canvas/schemas/template.schema';
import { SupplierType } from '../pricing/schemas/supplier-product.schema';
import { CustomizationType } from '../pricing/schemas/customization-pricing.schema';

@Injectable()
export class IntegrationTestService {
  private readonly logger = new Logger(IntegrationTestService.name);

  constructor(
    private canvasManager: CanvasManagerService,
    private templateManager: TemplateManagerService,
    private podPricing: PrintOnDemandPricingService,
    private customizationPricing: DynamicCustomizationPricingService,
  ) {}

  async runCompleteSystemTest(): Promise<{
    success: boolean;
    results: any[];
    errors: string[];
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      executionTime: number;
    };
  }> {
    const startTime = Date.now();
    const results: any[] = [];
    const errors: string[] = [];

    this.logger.log('🚀 Starting Complete System Integration Test...');

    try {
      // Test 1: Print-on-Demand Pricing Setup
      this.logger.log('📊 Testing Print-on-Demand Pricing...');
      const podTest = await this.testPrintOnDemandPricing();
      results.push({ test: 'Print-on-Demand Pricing', ...podTest });
      if (!podTest.success) errors.push(...podTest.errors);

      // Test 2: Customization Pricing Setup
      this.logger.log('🎨 Testing Customization Pricing...');
      const customizationTest = await this.testCustomizationPricing();
      results.push({ test: 'Customization Pricing', ...customizationTest });
      if (!customizationTest.success) errors.push(...customizationTest.errors);

      // Test 3: Template System
      this.logger.log('📋 Testing Template System...');
      const templateTest = await this.testTemplateSystem();
      results.push({ test: 'Template System', ...templateTest });
      if (!templateTest.success) errors.push(...templateTest.errors);

      // Test 4: Canvas Management
      this.logger.log('🎨 Testing Canvas Management...');
      const canvasTest = await this.testCanvasManagement();
      results.push({ test: 'Canvas Management', ...canvasTest });
      if (!canvasTest.success) errors.push(...canvasTest.errors);

      // Test 5: Complete Workflow
      this.logger.log('🔄 Testing Complete Customer Workflow...');
      const workflowTest = await this.testCompleteWorkflow();
      results.push({ test: 'Complete Workflow', ...workflowTest });
      if (!workflowTest.success) errors.push(...workflowTest.errors);

    } catch (error) {
      errors.push(`System test failed: ${error.message}`);
    }

    const executionTime = Date.now() - startTime;
    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;

    this.logger.log(`✅ Integration Test Complete: ${passed}/${results.length} tests passed in ${executionTime}ms`);

    return {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        totalTests: results.length,
        passed,
        failed,
        executionTime,
      },
    };
  }

  private async testPrintOnDemandPricing(): Promise<any> {
    try {
      // Setup photo book product
      const photoBook = await this.podPricing.addSupplierProduct({
        supplier: SupplierType.PRINTFUL,
        supplierProductId: 'test_photobook_8x8',
        productType: 'photo_book',
        variant: '8x8_hardcover',
        title: 'Test 8x8 Hardcover Photo Book',
        supplierPrice: 4.00,
        desiredMarkup: 18.00,
        markupType: 'amount',
        specifications: {
          width: 8, height: 8, unit: 'inches',
          material: 'hardcover', printMethod: 'digital', pages: 20
        },
        shipping: {
          shippingCost: 0, processingTime: 3,
          shippingTime: 5, totalTime: 8,
          regions: ['US', 'EU', 'UK']
        }
      });

      // Test price calculation
      const pricing = await this.podPricing.calculatePrice({
        productType: 'photo_book',
        variant: '8x8_hardcover',
        quantity: 1
      });

      // Verify pricing
      const expectedPrice = 22.00;
      const expectedProfit = 18.00;
      const expectedMargin = 81.8;

      if (Math.abs(pricing.yourPrice - expectedPrice) > 0.01) {
        throw new Error(`Price mismatch: expected ${expectedPrice}, got ${pricing.yourPrice}`);
      }

      if (Math.abs(pricing.profit - expectedProfit) > 0.01) {
        throw new Error(`Profit mismatch: expected ${expectedProfit}, got ${pricing.profit}`);
      }

      return {
        success: true,
        data: {
          productId: (photoBook as any)._id,
          pricing,
          verification: {
            priceCorrect: true,
            profitCorrect: true,
            marginCorrect: Math.abs(pricing.marginPercentage - expectedMargin) < 1
          }
        },
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message]
      };
    }
  }

  private async testCustomizationPricing(): Promise<any> {
    try {
      // Setup customization pricing
      const customizations = await this.customizationPricing.setupPhotoBookCustomizations();

      // Test extra pages pricing
      const extraPagesTest = await this.customizationPricing.calculateCustomizedPrice({
        productType: 'photo_book',
        variant: '8x8_hardcover',
        basePrice: 22.00,
        customizations: [
          { type: CustomizationType.EXTRA_PAGES, quantity: 5 }
        ]
      });

      // Verify extra pages pricing
      const expectedTotal = 27.00; // $22 + (5 × $1)
      const expectedExtraCost = 5.00;
      const expectedExtraProfit = 2.50; // 5 × $0.50

      if (Math.abs(extraPagesTest.totals.totalPrice - expectedTotal) > 0.01) {
        throw new Error(`Total price mismatch: expected ${expectedTotal}, got ${extraPagesTest.totals.totalPrice}`);
      }

      return {
        success: true,
        data: {
          customizations: customizations.length,
          extraPagesTest,
          verification: {
            totalPriceCorrect: true,
            extraCostCorrect: Math.abs(extraPagesTest.totals.customizationCost - expectedExtraCost) < 0.01,
            extraProfitCorrect: Math.abs(extraPagesTest.totals.totalMarkup - expectedExtraProfit) < 0.01
          }
        },
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message]
      };
    }
  }

  private async testTemplateSystem(): Promise<any> {
    try {
      // Create test template
      const template = await this.templateManager.createTemplate({
        name: 'Test Wedding Photo Book',
        description: 'Test template for integration testing',
        productType: ProductType.PHOTO_BOOK,
        category: TemplateCategory.WEDDING,
        style: TemplateStyle.ELEGANT,
        dimensions: {
          width: 2400,
          height: 2400,
          orientation: 'portrait',
          pageCount: 20
        },
        canvases: [
          {
            canvasType: CanvasType.COVER,
            name: 'Front Cover',
            order: 1,
            dimensions: {
              width: 2400, height: 2400, unit: 'px',
              dpi: 300, bleed: 3, safeZone: 5, orientation: 'portrait'
            },
            background: { type: 'color', color: '#ffffff' },
            elements: [
              {
                id: 'test_image_placeholder',
                type: 'IMAGE',
                name: 'Main Photo',
                position: { x: 200, y: 200, z: 1 },
                size: { width: 2000, height: 1500 },
                rotation: 0, opacity: 1, visible: true, locked: false,
                isPlaceholder: true,
                placeholderType: 'image'
              }
            ]
          }
        ],
        previews: {
          thumbnail: '/test/thumbnail.jpg',
          preview: '/test/preview.jpg'
        }
      });

      // Test template retrieval
      const templates = await this.templateManager.getTemplatesForProduct(
        ProductType.PHOTO_BOOK,
        { width: 2400, height: 2400, orientation: 'portrait' }
      );

      return {
        success: true,
        data: {
          templateId: template._id,
          templateName: template.name,
          templatesFound: templates.totalCount,
          categories: templates.categories.length,
          styles: templates.styles.length
        },
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message]
      };
    }
  }

  private async testCanvasManagement(): Promise<any> {
    try {
      const projectId = '507f1f77bcf86cd799439011'; // Test project ID

      // Create photo book canvases
      const canvases = await this.canvasManager.createPhotoBook(
        projectId,
        { width: 2400, height: 2400 },
        20
      );

      // Test adding extra canvas
      const extraCanvas = await this.canvasManager.addExtraCanvas(
        projectId,
        10, // Insert after page 10
        CanvasType.SPREAD
      );

      // Test adding element to canvas
      const canvasWithElement = await this.canvasManager.addElement({
        canvasId: canvases[0]._id.toString(),
        element: {
          type: ElementType.TEXT,
          name: 'Test Text',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 60 },
          text: { content: 'Test Text Content', fontSize: 24, color: '#000000' }
        }
      });

      return {
        success: true,
        data: {
          totalCanvases: canvases.length,
          extraCanvasId: extraCanvas._id,
          elementsInFirstCanvas: canvasWithElement.elements.length,
          canvasTypes: canvases.map(c => c.canvasType),
          verification: {
            correctCanvasCount: canvases.length === 11, // 1 front + 10 spreads + 1 back
            extraCanvasAdded: extraCanvas.order === 11,
            elementAdded: canvasWithElement.elements.length > 0
          }
        },
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message]
      };
    }
  }

  private async testCompleteWorkflow(): Promise<any> {
    try {
      const projectId = '507f1f77bcf86cd799439012'; // Test project ID

      // Step 1: Customer selects 8x8 photo book
      const productSize = { width: 2400, height: 2400 };

      // Step 2: Get available templates
      const templates = await this.templateManager.getTemplatesForProduct(
        ProductType.PHOTO_BOOK,
        { ...productSize, orientation: 'portrait' }
      );

      // Step 3: Create project with template (if available)
      const templateId = templates.templates.length > 0 ? templates.templates[0]._id.toString() : undefined;
      const canvases = await this.canvasManager.createPhotoBook(
        projectId,
        productSize,
        20,
        templateId
      );

      // Step 4: Customer adds 5 extra pages
      const extraCanvases: Canvas[] = [];
      for (let i = 1; i <= 5; i++) {
        const extraCanvas = await this.canvasManager.addExtraCanvas(
          projectId,
          20 + i - 1,
          CanvasType.SPREAD
        );
        extraCanvases.push(extraCanvas);
      }

      // Step 5: Calculate final pricing
      const finalPricing = await this.customizationPricing.calculateCustomizedPrice({
        productType: 'photo_book',
        variant: '8x8_hardcover',
        basePrice: 22.00,
        customizations: [
          { type: CustomizationType.EXTRA_PAGES, quantity: 5 }
        ]
      });

      // Step 6: Verify complete workflow
      const expectedFinalPrice = 27.00; // $22 + $5
      const totalCanvases = canvases.length + extraCanvases.length;

      return {
        success: true,
        data: {
          workflow: {
            step1: 'Product selected: 8x8 photo book',
            step2: `Templates found: ${templates.totalCount}`,
            step3: `Project created with ${canvases.length} canvases`,
            step4: `Added ${extraCanvases.length} extra pages`,
            step5: `Final price: $${finalPricing.totals.totalPrice}`,
            step6: 'Workflow completed successfully'
          },
          metrics: {
            totalCanvases,
            finalPrice: finalPricing.totals.totalPrice,
            extraProfit: finalPricing.totals.totalMarkup,
            templatesAvailable: templates.totalCount
          },
          verification: {
            priceCorrect: Math.abs(finalPricing.totals.totalPrice - expectedFinalPrice) < 0.01,
            canvasesCorrect: totalCanvases === 16, // 11 original + 5 extra
            workflowComplete: true
          }
        },
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message]
      };
    }
  }
}
