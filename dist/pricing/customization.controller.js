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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dynamic_customization_pricing_service_1 = require("./dynamic-customization-pricing.service");
const customization_pricing_schema_1 = require("./schemas/customization-pricing.schema");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let CustomizationController = class CustomizationController {
    customizationPricingService;
    constructor(customizationPricingService) {
        this.customizationPricingService = customizationPricingService;
    }
    async calculateCustomizedPrice(request) {
        return this.customizationPricingService.calculateCustomizedPrice(request);
    }
    async getAvailableCustomizations(productType, variant) {
        return this.customizationPricingService.getAvailableCustomizations(productType, variant);
    }
    async setupPhotoBookCustomizations() {
        return this.customizationPricingService.setupPhotoBookCustomizations();
    }
    async updateCustomizationPrice(productType, customizationType, updates) {
        return this.customizationPricingService.updateCustomizationPrice(productType, customizationType, updates);
    }
    async exampleExtraPages() {
        const calculation = await this.customizationPricingService.exampleExtraPages();
        return {
            scenario: 'Customer adds 5 extra pages to $22 photo book',
            calculation,
            explanation: [
                `Original photo book: $${calculation.basePrice}`,
                `Extra pages: ${calculation.customizations[0]?.quantity} × $${calculation.customizations[0]?.unitPrice} = $${calculation.customizations[0]?.totalPrice}`,
                `New total: $${calculation.totals.totalPrice}`,
                `Your extra profit: $${calculation.customizations[0]?.markup}`,
                `Supplier extra cost: $${calculation.customizations[0]?.supplierCost}`,
                'Customer pays more, you profit more!',
            ],
        };
    }
    async exampleMultipleCustomizations() {
        const calculation = await this.customizationPricingService.exampleMultipleCustomizations();
        const breakdown = [
            `Base photo book: $${calculation.basePrice}`,
            ...calculation.customizations.map(c => `${c.name}: ${c.quantity > 1 ? `${c.quantity} × ` : ''}$${c.unitPrice} = $${c.totalPrice} (your profit: $${c.markup})`),
            `Total price: $${calculation.totals.totalPrice}`,
            `Total extra profit: $${calculation.totals.totalMarkup}`,
            `Processing time: ${calculation.processingTime.total} days`,
        ];
        return {
            scenario: 'Customer adds 8 extra pages + premium cover + premium paper',
            calculation,
            breakdown,
        };
    }
    async editorIntegration(request) {
        const currentPrice = await this.customizationPricingService.calculateCustomizedPrice({
            productType: request.productType,
            variant: request.variant,
            basePrice: request.basePrice,
            customizations: request.currentCustomizations,
        });
        let newPrice;
        let priceChange;
        if (request.newCustomization) {
            newPrice = await this.customizationPricingService.calculateCustomizedPrice({
                productType: request.productType,
                variant: request.variant,
                basePrice: request.basePrice,
                customizations: [...request.currentCustomizations, request.newCustomization],
            });
            const priceDiff = newPrice.totals.totalPrice - currentPrice.totals.totalPrice;
            priceChange = {
                amount: priceDiff,
                percentage: (priceDiff / currentPrice.totals.totalPrice) * 100,
            };
        }
        return {
            currentPrice,
            newPrice,
            priceChange,
        };
    }
    async getPricingGuide(productType) {
        const customizations = await this.customizationPricingService.getAvailableCustomizations(productType);
        return {
            product: productType,
            basePrice: 22.00,
            customizations: customizations.map(c => ({
                type: c.customizationType,
                name: c.name,
                description: c.description || '',
                pricing: this.formatPricingDescription(c),
                examples: this.generatePricingExamples(c),
            })),
        };
    }
    formatPricingDescription(customization) {
        switch (customization.pricingModel) {
            case 'PER_UNIT':
                return `$${customization.customerPrice} per ${customization.customizationType.toLowerCase().replace('_', ' ')}`;
            case 'FLAT_FEE':
                return `$${customization.customerPrice} flat fee`;
            case 'TIERED':
                return 'Tiered pricing based on quantity';
            case 'PERCENTAGE':
                return `${customization.customerPrice}% of base price`;
            default:
                return `$${customization.customerPrice}`;
        }
    }
    generatePricingExamples(customization) {
        const examples = [];
        switch (customization.customizationType) {
            case customization_pricing_schema_1.CustomizationType.EXTRA_PAGES:
                examples.push('1 extra page: +$1.00', '5 extra pages: +$5.00', '10 extra pages: +$10.00');
                break;
            case customization_pricing_schema_1.CustomizationType.COVER_UPGRADE:
                examples.push('Premium hardcover: +$5.00', 'Includes dust jacket', 'Better protection and presentation');
                break;
            case customization_pricing_schema_1.CustomizationType.PAPER_UPGRADE:
                examples.push('Premium glossy paper: +$5.00', 'Better photo quality', 'More vibrant colors');
                break;
            default:
                examples.push(`Base price: $${customization.customerPrice}`);
        }
        return examples;
    }
};
exports.CustomizationController = CustomizationController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate price with customizations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customized price calculated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "calculateCustomizedPrice", null);
__decorate([
    (0, common_1.Get)('available/:productType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available customizations for a product' }),
    (0, swagger_1.ApiQuery)({ name: 'variant', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available customizations retrieved successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __param(1, (0, common_1.Query)('variant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "getAvailableCustomizations", null);
__decorate([
    (0, common_1.Post)('setup/photo-book'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Setup photo book customizations (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Photo book customizations setup successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "setupPhotoBookCustomizations", null);
__decorate([
    (0, common_1.Put)(':productType/:customizationType/pricing'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update customization pricing (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customization pricing updated successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __param(1, (0, common_1.Param)('customizationType')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "updateCustomizationPrice", null);
__decorate([
    (0, common_1.Post)('examples/extra-pages'),
    (0, swagger_1.ApiOperation)({ summary: 'Example: Customer adds extra pages to photo book' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Extra pages pricing calculated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "exampleExtraPages", null);
__decorate([
    (0, common_1.Post)('examples/multiple-upgrades'),
    (0, swagger_1.ApiOperation)({ summary: 'Example: Customer adds multiple customizations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Multiple customizations pricing calculated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "exampleMultipleCustomizations", null);
__decorate([
    (0, common_1.Post)('editor-integration'),
    (0, swagger_1.ApiOperation)({ summary: 'Real-time pricing for editor integration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Real-time pricing calculated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "editorIntegration", null);
__decorate([
    (0, common_1.Get)('pricing-guide/:productType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pricing guide for product customizations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pricing guide retrieved successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomizationController.prototype, "getPricingGuide", null);
exports.CustomizationController = CustomizationController = __decorate([
    (0, swagger_1.ApiTags)('Product Customization Pricing'),
    (0, common_1.Controller)('pricing/customizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [dynamic_customization_pricing_service_1.DynamicCustomizationPricingService])
], CustomizationController);
//# sourceMappingURL=customization.controller.js.map