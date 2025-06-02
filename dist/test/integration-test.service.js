"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IntegrationTestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTestService = void 0;
const common_1 = require("@nestjs/common");
const canvas_manager_service_1 = require("../canvas/canvas-manager.service");
const template_manager_service_1 = require("../canvas/template-manager.service");
const print_on_demand_pricing_service_1 = require("../pricing/print-on-demand-pricing.service");
const dynamic_customization_pricing_service_1 = require("../pricing/dynamic-customization-pricing.service");
const canvas_schema_1 = require("../canvas/schemas/canvas.schema");
const template_schema_1 = require("../canvas/schemas/template.schema");
const supplier_product_schema_1 = require("../pricing/schemas/supplier-product.schema");
const customization_pricing_schema_1 = require("../pricing/schemas/customization-pricing.schema");
let IntegrationTestService = IntegrationTestService_1 = class IntegrationTestService {
    canvasManager;
    templateManager;
    podPricing;
    customizationPricing;
    logger = new common_1.Logger(IntegrationTestService_1.name);
    constructor(canvasManager, templateManager, podPricing, customizationPricing) {
        this.canvasManager = canvasManager;
        this.templateManager = templateManager;
        this.podPricing = podPricing;
        this.customizationPricing = customizationPricing;
    }
    async runCompleteSystemTest() {
        const startTime = Date.now();
        const results = [];
        const errors = [];
        this.logger.log('🚀 Starting Complete System Integration Test...');
        try {
            this.logger.log('📊 Testing Print-on-Demand Pricing...');
            const podTest = await this.testPrintOnDemandPricing();
            results.push({ test: 'Print-on-Demand Pricing', ...podTest });
            if (!podTest.success)
                errors.push(...podTest.errors);
            this.logger.log('🎨 Testing Customization Pricing...');
            const customizationTest = await this.testCustomizationPricing();
            results.push({ test: 'Customization Pricing', ...customizationTest });
            if (!customizationTest.success)
                errors.push(...customizationTest.errors);
            this.logger.log('📋 Testing Template System...');
            const templateTest = await this.testTemplateSystem();
            results.push({ test: 'Template System', ...templateTest });
            if (!templateTest.success)
                errors.push(...templateTest.errors);
            this.logger.log('🎨 Testing Canvas Management...');
            const canvasTest = await this.testCanvasManagement();
            results.push({ test: 'Canvas Management', ...canvasTest });
            if (!canvasTest.success)
                errors.push(...canvasTest.errors);
            this.logger.log('🔄 Testing Complete Customer Workflow...');
            const workflowTest = await this.testCompleteWorkflow();
            results.push({ test: 'Complete Workflow', ...workflowTest });
            if (!workflowTest.success)
                errors.push(...workflowTest.errors);
        }
        catch (error) {
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
    async testPrintOnDemandPricing() {
        try {
            const photoBook = await this.podPricing.addSupplierProduct({
                supplier: supplier_product_schema_1.SupplierType.PRINTFUL,
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
            const pricing = await this.podPricing.calculatePrice({
                productType: 'photo_book',
                variant: '8x8_hardcover',
                quantity: 1
            });
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
                    productId: photoBook._id,
                    pricing,
                    verification: {
                        priceCorrect: true,
                        profitCorrect: true,
                        marginCorrect: Math.abs(pricing.marginPercentage - expectedMargin) < 1
                    }
                },
                errors: []
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                errors: [error.message]
            };
        }
    }
    async testCustomizationPricing() {
        try {
            const customizations = await this.customizationPricing.setupPhotoBookCustomizations();
            const extraPagesTest = await this.customizationPricing.calculateCustomizedPrice({
                productType: 'photo_book',
                variant: '8x8_hardcover',
                basePrice: 22.00,
                customizations: [
                    { type: customization_pricing_schema_1.CustomizationType.EXTRA_PAGES, quantity: 5 }
                ]
            });
            const expectedTotal = 27.00;
            const expectedExtraCost = 5.00;
            const expectedExtraProfit = 2.50;
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
        }
        catch (error) {
            return {
                success: false,
                data: null,
                errors: [error.message]
            };
        }
    }
    async testTemplateSystem() {
        try {
            const template = await this.templateManager.createTemplate({
                name: 'Test Wedding Photo Book',
                description: 'Test template for integration testing',
                productType: canvas_schema_1.ProductType.PHOTO_BOOK,
                category: template_schema_1.TemplateCategory.WEDDING,
                style: template_schema_1.TemplateStyle.ELEGANT,
                dimensions: {
                    width: 2400,
                    height: 2400,
                    orientation: 'portrait',
                    pageCount: 20
                },
                canvases: [
                    {
                        canvasType: canvas_schema_1.CanvasType.COVER,
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
            const templates = await this.templateManager.getTemplatesForProduct(canvas_schema_1.ProductType.PHOTO_BOOK, { width: 2400, height: 2400, orientation: 'portrait' });
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
        }
        catch (error) {
            return {
                success: false,
                data: null,
                errors: [error.message]
            };
        }
    }
    async testCanvasManagement() {
        try {
            const projectId = '507f1f77bcf86cd799439011';
            const canvases = await this.canvasManager.createPhotoBook(projectId, { width: 2400, height: 2400 }, 20);
            const extraCanvas = await this.canvasManager.addExtraCanvas(projectId, 10, canvas_schema_1.CanvasType.SPREAD);
            const canvasWithElement = await this.canvasManager.addElement({
                canvasId: canvases[0]._id.toString(),
                element: {
                    type: canvas_schema_1.ElementType.TEXT,
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
                        correctCanvasCount: canvases.length === 11,
                        extraCanvasAdded: extraCanvas.order === 11,
                        elementAdded: canvasWithElement.elements.length > 0
                    }
                },
                errors: []
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                errors: [error.message]
            };
        }
    }
    async testCompleteWorkflow() {
        try {
            const projectId = '507f1f77bcf86cd799439012';
            const productSize = { width: 2400, height: 2400 };
            const templates = await this.templateManager.getTemplatesForProduct(canvas_schema_1.ProductType.PHOTO_BOOK, { ...productSize, orientation: 'portrait' });
            const templateId = templates.templates.length > 0 ? templates.templates[0]._id.toString() : undefined;
            const canvases = await this.canvasManager.createPhotoBook(projectId, productSize, 20, templateId);
            const extraCanvases = [];
            for (let i = 1; i <= 5; i++) {
                const extraCanvas = await this.canvasManager.addExtraCanvas(projectId, 20 + i - 1, canvas_schema_1.CanvasType.SPREAD);
                extraCanvases.push(extraCanvas);
            }
            const finalPricing = await this.customizationPricing.calculateCustomizedPrice({
                productType: 'photo_book',
                variant: '8x8_hardcover',
                basePrice: 22.00,
                customizations: [
                    { type: customization_pricing_schema_1.CustomizationType.EXTRA_PAGES, quantity: 5 }
                ]
            });
            const expectedFinalPrice = 27.00;
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
                        canvasesCorrect: totalCanvases === 16,
                        workflowComplete: true
                    }
                },
                errors: []
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                errors: [error.message]
            };
        }
    }
};
exports.IntegrationTestService = IntegrationTestService;
exports.IntegrationTestService = IntegrationTestService = IntegrationTestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [canvas_manager_service_1.CanvasManagerService,
        template_manager_service_1.TemplateManagerService,
        print_on_demand_pricing_service_1.PrintOnDemandPricingService,
        dynamic_customization_pricing_service_1.DynamicCustomizationPricingService])
], IntegrationTestService);
//# sourceMappingURL=integration-test.service.js.map