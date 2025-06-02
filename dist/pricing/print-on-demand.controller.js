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
exports.PrintOnDemandController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const print_on_demand_pricing_service_1 = require("./print-on-demand-pricing.service");
const supplier_product_schema_1 = require("./schemas/supplier-product.schema");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
let PrintOnDemandController = class PrintOnDemandController {
    podPricingService;
    constructor(podPricingService) {
        this.podPricingService = podPricingService;
    }
    async calculatePrice(request) {
        return this.podPricingService.calculatePrice(request);
    }
    async compareSuppliers(request) {
        return this.podPricingService.compareSuppliers(request);
    }
    async addSupplierProduct(productData) {
        return this.podPricingService.addSupplierProduct(productData);
    }
    async setupPhotoBook() {
        return this.podPricingService.addPhotoBookFromPrintful();
    }
    async updateMarkup(productType, variant, supplier, updateData) {
        return this.podPricingService.updateMarkup(productType, variant, supplier, updateData.newMarkup, updateData.markupType);
    }
    async syncSupplierPrices(supplier) {
        return this.podPricingService.syncSupplierPrices(supplier);
    }
    async getProfitReport(startDate, endDate) {
        return this.podPricingService.getProfitReport({
            start: new Date(startDate),
            end: new Date(endDate),
        });
    }
    async examplePhotoBookPricing() {
        const calculation = await this.podPricingService.calculatePrice({
            productType: 'photo_book',
            variant: '8x8_hardcover',
            quantity: 1,
        });
        return {
            example: 'Photo Book: $4 supplier cost → $22 your price',
            calculation,
            explanation: [
                `Supplier (Printful) charges: $${calculation.supplierPrice}`,
                `You sell for: $${calculation.yourPrice}`,
                `Your profit per book: $${calculation.profit}`,
                `Markup percentage: ${calculation.markupPercentage.toFixed(1)}%`,
                `Profit margin: ${calculation.marginPercentage.toFixed(1)}%`,
                'Supplier handles printing, shipping, and fulfillment',
                'You just collect the profit difference!',
            ],
        };
    }
    async calculateMarkup(supplierPrice, sellingPrice, markupAmount, markupPercentage) {
        let finalSellingPrice;
        let finalMarkupAmount;
        if (sellingPrice) {
            finalSellingPrice = sellingPrice;
            finalMarkupAmount = sellingPrice - supplierPrice;
        }
        else if (markupAmount) {
            finalMarkupAmount = markupAmount;
            finalSellingPrice = supplierPrice + markupAmount;
        }
        else if (markupPercentage) {
            finalMarkupAmount = supplierPrice * (markupPercentage / 100);
            finalSellingPrice = supplierPrice + finalMarkupAmount;
        }
        else {
            throw new Error('Provide either sellingPrice, markupAmount, or markupPercentage');
        }
        const finalMarkupPercentage = (finalMarkupAmount / supplierPrice) * 100;
        const finalMarginPercentage = (finalMarkupAmount / finalSellingPrice) * 100;
        return {
            supplierPrice,
            sellingPrice: finalSellingPrice,
            markupAmount: finalMarkupAmount,
            markupPercentage: finalMarkupPercentage,
            marginPercentage: finalMarginPercentage,
            examples: [
                `If supplier charges $${supplierPrice}`,
                `And you sell for $${finalSellingPrice}`,
                `Your profit is $${finalMarkupAmount} per item`,
                `That's a ${finalMarkupPercentage.toFixed(1)}% markup`,
                `And a ${finalMarginPercentage.toFixed(1)}% profit margin`,
                `On 100 items, you'd make $${(finalMarkupAmount * 100).toFixed(2)} profit`,
            ],
        };
    }
};
exports.PrintOnDemandController = PrintOnDemandController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate price for print-on-demand product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price calculated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "calculatePrice", null);
__decorate([
    (0, common_1.Post)('compare-suppliers'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare prices across all suppliers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supplier comparison completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "compareSuppliers", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Add new supplier product (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product added successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "addSupplierProduct", null);
__decorate([
    (0, common_1.Post)('products/photo-book/setup'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Quick setup: Add photo book from Printful (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Photo book product added successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "setupPhotoBook", null);
__decorate([
    (0, common_1.Put)('products/:productType/:variant/:supplier/markup'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update product markup (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Markup updated successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __param(1, (0, common_1.Param)('variant')),
    __param(2, (0, common_1.Param)('supplier')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "updateMarkup", null);
__decorate([
    (0, common_1.Post)('sync/:supplier'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Sync prices from supplier API (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prices synced successfully' }),
    __param(0, (0, common_1.Param)('supplier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "syncSupplierPrices", null);
__decorate([
    (0, common_1.Get)('profit-report'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get profit report (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profit report generated successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "getProfitReport", null);
__decorate([
    (0, common_1.Post)('examples/photo-book-pricing'),
    (0, swagger_1.ApiOperation)({ summary: 'Example: Calculate photo book pricing ($4 cost → $22 selling)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Example pricing calculated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "examplePhotoBookPricing", null);
__decorate([
    (0, common_1.Get)('markup-calculator'),
    (0, swagger_1.ApiOperation)({ summary: 'Markup calculator tool' }),
    (0, swagger_1.ApiQuery)({ name: 'supplierPrice', type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'sellingPrice', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'markupAmount', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'markupPercentage', type: 'number', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Markup calculated' }),
    __param(0, (0, common_1.Query)('supplierPrice')),
    __param(1, (0, common_1.Query)('sellingPrice')),
    __param(2, (0, common_1.Query)('markupAmount')),
    __param(3, (0, common_1.Query)('markupPercentage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], PrintOnDemandController.prototype, "calculateMarkup", null);
exports.PrintOnDemandController = PrintOnDemandController = __decorate([
    (0, swagger_1.ApiTags)('Print-on-Demand Pricing'),
    (0, common_1.Controller)('pricing/print-on-demand'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [print_on_demand_pricing_service_1.PrintOnDemandPricingService])
], PrintOnDemandController);
//# sourceMappingURL=print-on-demand.controller.js.map