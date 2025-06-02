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
var DynamicCustomizationPricingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicCustomizationPricingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const customization_pricing_schema_1 = require("./schemas/customization-pricing.schema");
let DynamicCustomizationPricingService = DynamicCustomizationPricingService_1 = class DynamicCustomizationPricingService {
    customizationPricingModel;
    logger = new common_1.Logger(DynamicCustomizationPricingService_1.name);
    constructor(customizationPricingModel) {
        this.customizationPricingModel = customizationPricingModel;
    }
    async setupPhotoBookCustomizations() {
        const customizations = [
            {
                productType: 'photo_book',
                customizationType: customization_pricing_schema_1.CustomizationType.EXTRA_PAGES,
                name: 'Extra Pages',
                description: 'Add additional pages to your photo book',
                pricingModel: customization_pricing_schema_1.PricingModel.PER_UNIT,
                supplierCost: 0.50,
                markup: 0.50,
                customerPrice: 1.00,
                limits: { min: 0, max: 100, default: 0 },
                display: {
                    displayName: 'Add Extra Pages',
                    icon: 'pages-icon',
                    category: 'Layout',
                    sortOrder: 1,
                    tooltip: 'Add more pages to include more photos (+$1.00 per page)',
                    previewImage: '/images/extra-pages-preview.jpg',
                },
                supplierInfo: {
                    supplierId: 'printful',
                    supplierSku: 'extra-page',
                    processingTime: 0,
                    availability: ['US', 'EU', 'UK'],
                },
            },
            {
                productType: 'photo_book',
                customizationType: customization_pricing_schema_1.CustomizationType.COVER_UPGRADE,
                name: 'Premium Cover',
                description: 'Upgrade to premium hardcover with dust jacket',
                pricingModel: customization_pricing_schema_1.PricingModel.FLAT_FEE,
                supplierCost: 3.00,
                markup: 2.00,
                customerPrice: 5.00,
                display: {
                    displayName: 'Premium Hardcover',
                    icon: 'cover-icon',
                    category: 'Cover',
                    sortOrder: 1,
                    tooltip: 'Upgrade to premium hardcover with dust jacket (+$5.00)',
                    previewImage: '/images/premium-cover-preview.jpg',
                },
            },
            {
                productType: 'photo_book',
                customizationType: customization_pricing_schema_1.CustomizationType.PAPER_UPGRADE,
                name: 'Premium Paper',
                description: 'Upgrade to premium glossy paper',
                pricingModel: customization_pricing_schema_1.PricingModel.FLAT_FEE,
                supplierCost: 2.00,
                markup: 3.00,
                customerPrice: 5.00,
                display: {
                    displayName: 'Premium Glossy Paper',
                    icon: 'paper-icon',
                    category: 'Paper',
                    sortOrder: 1,
                    tooltip: 'Upgrade to premium glossy paper for better photo quality (+$5.00)',
                    previewImage: '/images/premium-paper-preview.jpg',
                },
            },
            {
                productType: 'photo_book',
                customizationType: customization_pricing_schema_1.CustomizationType.SIZE_UPGRADE,
                name: 'Size Upgrade',
                description: 'Upgrade to larger size',
                pricingModel: customization_pricing_schema_1.PricingModel.TIERED,
                supplierCost: 0,
                markup: 0,
                customerPrice: 0,
                tiers: [
                    { minQuantity: 1, maxQuantity: 1, supplierCost: 2.00, customerPrice: 5.00, markup: 3.00 },
                    { minQuantity: 2, maxQuantity: 2, supplierCost: 4.00, customerPrice: 10.00, markup: 6.00 },
                    { minQuantity: 3, maxQuantity: 3, supplierCost: 6.00, customerPrice: 15.00, markup: 9.00 },
                ],
                display: {
                    displayName: 'Upgrade Size',
                    icon: 'size-icon',
                    category: 'Size',
                    sortOrder: 1,
                    tooltip: 'Upgrade to larger size (10x10: +$5, 12x12: +$10, 14x14: +$15)',
                    previewImage: '/images/size-upgrade-preview.jpg',
                },
            },
        ];
        const savedCustomizations = [];
        for (const customization of customizations) {
            const saved = await this.customizationPricingModel.create(customization);
            savedCustomizations.push(saved);
        }
        return savedCustomizations;
    }
    async calculateCustomizedPrice(request) {
        const result = {
            basePrice: request.basePrice,
            customizations: [],
            totals: {
                basePrice: request.basePrice,
                customizationCost: 0,
                totalPrice: request.basePrice,
                totalSupplierCost: 0,
                totalMarkup: 0,
                marginPercentage: 0,
            },
            processingTime: {
                base: 3,
                additional: 0,
                total: 3,
            },
        };
        for (const customization of request.customizations) {
            const pricing = await this.getCustomizationPricing(request.productType, customization.type, request.variant);
            if (!pricing) {
                this.logger.warn(`Customization pricing not found: ${customization.type} for ${request.productType}`);
                continue;
            }
            const customizationResult = this.calculateCustomizationCost(pricing, customization.quantity);
            result.customizations.push({
                type: customization.type,
                name: pricing.name,
                quantity: customization.quantity,
                unitPrice: customizationResult.unitPrice,
                totalPrice: customizationResult.totalPrice,
                supplierCost: customizationResult.supplierCost,
                markup: customizationResult.markup,
                description: pricing.description,
            });
            result.totals.customizationCost += customizationResult.totalPrice;
            result.totals.totalSupplierCost += customizationResult.supplierCost;
            result.totals.totalMarkup += customizationResult.markup;
            if (pricing.supplierInfo?.processingTime) {
                result.processingTime.additional += pricing.supplierInfo.processingTime;
            }
        }
        result.totals.totalPrice = result.totals.basePrice + result.totals.customizationCost;
        result.totals.marginPercentage = (result.totals.totalMarkup / result.totals.totalPrice) * 100;
        result.processingTime.total = result.processingTime.base + result.processingTime.additional;
        return result;
    }
    async getAvailableCustomizations(productType, variant) {
        const query = {
            productType,
            isActive: true,
        };
        if (variant) {
            query.$or = [
                { variant },
                { variant: { $exists: false } },
            ];
        }
        return this.customizationPricingModel
            .find(query)
            .sort({ 'display.category': 1, 'display.sortOrder': 1 })
            .exec();
    }
    async exampleExtraPages() {
        return this.calculateCustomizedPrice({
            productType: 'photo_book',
            variant: '8x8_hardcover',
            basePrice: 22.00,
            customizations: [
                {
                    type: customization_pricing_schema_1.CustomizationType.EXTRA_PAGES,
                    quantity: 5,
                },
            ],
        });
    }
    async exampleMultipleCustomizations() {
        return this.calculateCustomizedPrice({
            productType: 'photo_book',
            variant: '8x8_hardcover',
            basePrice: 22.00,
            customizations: [
                {
                    type: customization_pricing_schema_1.CustomizationType.EXTRA_PAGES,
                    quantity: 8,
                },
                {
                    type: customization_pricing_schema_1.CustomizationType.COVER_UPGRADE,
                    quantity: 1,
                },
                {
                    type: customization_pricing_schema_1.CustomizationType.PAPER_UPGRADE,
                    quantity: 1,
                },
            ],
        });
    }
    async updateCustomizationPrice(productType, customizationType, updates) {
        const customization = await this.customizationPricingModel
            .findOne({ productType, customizationType, isActive: true })
            .exec();
        if (!customization) {
            throw new Error(`Customization not found: ${customizationType} for ${productType}`);
        }
        if (updates.supplierCost !== undefined) {
            customization.supplierCost = updates.supplierCost;
        }
        if (updates.markup !== undefined) {
            customization.markup = updates.markup;
        }
        if (updates.customerPrice !== undefined) {
            customization.customerPrice = updates.customerPrice;
        }
        if (updates.customerPrice === undefined && (updates.supplierCost !== undefined || updates.markup !== undefined)) {
            customization.customerPrice = customization.supplierCost + customization.markup;
        }
        return customization.save();
    }
    async getCustomizationPricing(productType, customizationType, variant) {
        const query = {
            productType,
            customizationType,
            isActive: true,
        };
        if (variant) {
            query.$or = [
                { variant },
                { variant: { $exists: false } },
            ];
        }
        return this.customizationPricingModel.findOne(query).exec();
    }
    calculateCustomizationCost(pricing, quantity) {
        let unitPrice;
        let unitSupplierCost;
        let unitMarkup;
        switch (pricing.pricingModel) {
            case customization_pricing_schema_1.PricingModel.PER_UNIT:
                unitPrice = pricing.customerPrice;
                unitSupplierCost = pricing.supplierCost;
                unitMarkup = pricing.markup;
                break;
            case customization_pricing_schema_1.PricingModel.FLAT_FEE:
                unitPrice = pricing.customerPrice;
                unitSupplierCost = pricing.supplierCost;
                unitMarkup = pricing.markup;
                quantity = 1;
                break;
            case customization_pricing_schema_1.PricingModel.TIERED:
                const tier = pricing.tiers?.find(t => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity));
                if (tier) {
                    unitPrice = tier.customerPrice;
                    unitSupplierCost = tier.supplierCost;
                    unitMarkup = tier.markup;
                }
                else {
                    unitPrice = pricing.customerPrice;
                    unitSupplierCost = pricing.supplierCost;
                    unitMarkup = pricing.markup;
                }
                break;
            case customization_pricing_schema_1.PricingModel.PERCENTAGE:
                unitPrice = pricing.customerPrice;
                unitSupplierCost = pricing.supplierCost;
                unitMarkup = pricing.markup;
                break;
            default:
                unitPrice = pricing.customerPrice;
                unitSupplierCost = pricing.supplierCost;
                unitMarkup = pricing.markup;
        }
        return {
            unitPrice,
            totalPrice: unitPrice * quantity,
            supplierCost: unitSupplierCost * quantity,
            markup: unitMarkup * quantity,
        };
    }
};
exports.DynamicCustomizationPricingService = DynamicCustomizationPricingService;
exports.DynamicCustomizationPricingService = DynamicCustomizationPricingService = DynamicCustomizationPricingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(customization_pricing_schema_1.CustomizationPricing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DynamicCustomizationPricingService);
//# sourceMappingURL=dynamic-customization-pricing.service.js.map