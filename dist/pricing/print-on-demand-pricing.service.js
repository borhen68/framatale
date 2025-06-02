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
var PrintOnDemandPricingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintOnDemandPricingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const supplier_product_schema_1 = require("./schemas/supplier-product.schema");
let PrintOnDemandPricingService = PrintOnDemandPricingService_1 = class PrintOnDemandPricingService {
    supplierProductModel;
    logger = new common_1.Logger(PrintOnDemandPricingService_1.name);
    constructor(supplierProductModel) {
        this.supplierProductModel = supplierProductModel;
    }
    async addSupplierProduct(productData) {
        let sellingPrice;
        let markup;
        let markupPercentage;
        let marginPercentage;
        if (productData.markupType === 'amount') {
            markup = productData.desiredMarkup;
            sellingPrice = productData.supplierPrice + markup;
            markupPercentage = (markup / productData.supplierPrice) * 100;
            marginPercentage = (markup / sellingPrice) * 100;
        }
        else {
            markupPercentage = productData.desiredMarkup;
            markup = productData.supplierPrice * (markupPercentage / 100);
            sellingPrice = productData.supplierPrice + markup;
            marginPercentage = (markup / sellingPrice) * 100;
        }
        const supplierProduct = new this.supplierProductModel({
            supplier: productData.supplier,
            supplierProductId: productData.supplierProductId,
            productType: productData.productType,
            variant: productData.variant,
            title: productData.title,
            supplierPrice: productData.supplierPrice,
            sellingPrice,
            markup,
            markupPercentage,
            marginPercentage,
            specifications: productData.specifications,
            shipping: productData.shipping,
            apiInfo: {
                apiEndpoint: this.getSupplierApiEndpoint(productData.supplier),
                lastSynced: new Date(),
                syncStatus: 'active',
                apiVersion: '1.0',
            },
            metadata: {
                category: productData.productType,
                tags: [productData.variant],
                popularity: 0,
                totalOrders: 0,
                revenue: 0,
            },
        });
        return supplierProduct.save();
    }
    async addPhotoBookFromPrintful() {
        return this.addSupplierProduct({
            supplier: supplier_product_schema_1.SupplierType.PRINTFUL,
            supplierProductId: 'printful_photobook_8x8',
            productType: 'photo_book',
            variant: '8x8_hardcover',
            title: '8x8 Hardcover Photo Book',
            supplierPrice: 4.00,
            desiredMarkup: 18.00,
            markupType: 'amount',
            specifications: {
                width: 8,
                height: 8,
                unit: 'inches',
                material: 'hardcover',
                printMethod: 'digital',
                pages: 20,
            },
            shipping: {
                shippingCost: 0,
                processingTime: 3,
                shippingTime: 5,
                totalTime: 8,
                regions: ['US', 'EU', 'UK'],
            },
        });
    }
    async calculatePrice(request) {
        const product = await this.findBestProduct(request);
        if (!product) {
            throw new Error(`Product not found: ${request.productType} - ${request.variant}`);
        }
        let supplierPrice = product.supplierPrice;
        let sellingPrice = product.sellingPrice;
        if (product.volumePricing && request.quantity > 1) {
            const volumeTier = product.volumePricing.find(tier => request.quantity >= tier.minQuantity &&
                (!tier.maxQuantity || request.quantity <= tier.maxQuantity));
            if (volumeTier) {
                supplierPrice = volumeTier.supplierPrice;
                sellingPrice = volumeTier.sellingPrice;
            }
        }
        const markup = sellingPrice - supplierPrice;
        const markupPercentage = (markup / supplierPrice) * 100;
        const marginPercentage = (markup / sellingPrice) * 100;
        const profit = markup;
        const totalProfit = profit * request.quantity;
        return {
            supplierPrice,
            yourPrice: sellingPrice,
            markup,
            markupPercentage,
            marginPercentage,
            profit,
            totalProfit,
            supplier: product.supplier,
            productDetails: {
                title: product.title,
                specifications: product.specifications,
                shipping: product.shipping,
            },
        };
    }
    async compareSuppliers(request) {
        const products = await this.supplierProductModel
            .find({
            productType: request.productType,
            variant: request.variant,
            isActive: true,
            isAvailable: true,
        })
            .exec();
        const comparisons = [];
        for (const product of products) {
            const calculation = await this.calculatePrice({
                ...request,
                preferredSupplier: product.supplier,
            });
            let competitiveness = 'best_price';
            if (product.supplierPrice === Math.min(...products.map(p => p.supplierPrice))) {
                competitiveness = 'best_price';
            }
            else if (product.marginPercentage === Math.max(...products.map(p => p.marginPercentage))) {
                competitiveness = 'best_margin';
            }
            else if (product.shipping.totalTime === Math.min(...products.map(p => p.shipping.totalTime))) {
                competitiveness = 'fastest_shipping';
            }
            comparisons.push({
                product,
                calculation,
                competitiveness,
            });
        }
        return comparisons.sort((a, b) => b.calculation.marginPercentage - a.calculation.marginPercentage);
    }
    async updateMarkup(productType, variant, supplier, newMarkup, markupType) {
        const product = await this.supplierProductModel
            .findOne({ productType, variant, supplier, isActive: true })
            .exec();
        if (!product) {
            throw new Error('Product not found');
        }
        let sellingPrice;
        let markup;
        let markupPercentage;
        let marginPercentage;
        if (markupType === 'amount') {
            markup = newMarkup;
            sellingPrice = product.supplierPrice + markup;
            markupPercentage = (markup / product.supplierPrice) * 100;
            marginPercentage = (markup / sellingPrice) * 100;
        }
        else {
            markupPercentage = newMarkup;
            markup = product.supplierPrice * (markupPercentage / 100);
            sellingPrice = product.supplierPrice + markup;
            marginPercentage = (markup / sellingPrice) * 100;
        }
        product.sellingPrice = sellingPrice;
        product.markup = markup;
        product.markupPercentage = markupPercentage;
        product.marginPercentage = marginPercentage;
        return product.save();
    }
    async syncSupplierPrices(supplier) {
        const products = await this.supplierProductModel
            .find({ supplier, isActive: true })
            .exec();
        let updated = 0;
        const errors = [];
        for (const product of products) {
            try {
                const latestPrice = await this.fetchSupplierPrice(supplier, product.supplierProductId);
                if (latestPrice !== product.supplierPrice) {
                    const oldSupplierPrice = product.supplierPrice;
                    const newSupplierPrice = latestPrice;
                    const newSellingPrice = newSupplierPrice + product.markup;
                    const newMarkupPercentage = (product.markup / newSupplierPrice) * 100;
                    const newMarginPercentage = (product.markup / newSellingPrice) * 100;
                    product.supplierPrice = newSupplierPrice;
                    product.sellingPrice = newSellingPrice;
                    product.markupPercentage = newMarkupPercentage;
                    product.marginPercentage = newMarginPercentage;
                    product.apiInfo.lastSynced = new Date();
                    await product.save();
                    updated++;
                    this.logger.log(`Updated ${product.title}: ${oldSupplierPrice} -> ${newSupplierPrice}`);
                }
            }
            catch (error) {
                errors.push(`Failed to sync ${product.title}: ${error.message}`);
            }
        }
        return { updated, errors };
    }
    async getProfitReport(timeRange) {
        const products = await this.supplierProductModel.find({ isActive: true }).exec();
        const totalRevenue = 15000;
        const totalCosts = 3000;
        const totalProfit = totalRevenue - totalCosts;
        const profitMargin = (totalProfit / totalRevenue) * 100;
        return {
            totalRevenue,
            totalCosts,
            totalProfit,
            profitMargin,
            topProducts: [
                {
                    product: '8x8 Photo Book',
                    revenue: 5500,
                    profit: 4500,
                    margin: 81.8,
                    orders: 250,
                },
                {
                    product: '12x12 Canvas Print',
                    revenue: 3200,
                    profit: 2400,
                    margin: 75.0,
                    orders: 80,
                },
            ],
            supplierBreakdown: [
                {
                    supplier: supplier_product_schema_1.SupplierType.PRINTFUL,
                    revenue: 8000,
                    profit: 6500,
                    orders: 200,
                },
                {
                    supplier: supplier_product_schema_1.SupplierType.PRINTIFY,
                    revenue: 7000,
                    profit: 5500,
                    orders: 180,
                },
            ],
        };
    }
    async findBestProduct(request) {
        const query = {
            productType: request.productType,
            variant: request.variant,
            isActive: true,
            isAvailable: true,
        };
        if (request.preferredSupplier) {
            query.supplier = request.preferredSupplier;
        }
        return this.supplierProductModel
            .findOne(query)
            .sort({ marginPercentage: -1 })
            .exec();
    }
    async fetchSupplierPrice(supplier, productId) {
        switch (supplier) {
            case supplier_product_schema_1.SupplierType.PRINTFUL:
                return 4.25;
            case supplier_product_schema_1.SupplierType.PRINTIFY:
                return 3.95;
            default:
                return 4.00;
        }
    }
    getSupplierApiEndpoint(supplier) {
        switch (supplier) {
            case supplier_product_schema_1.SupplierType.PRINTFUL:
                return 'https://api.printful.com';
            case supplier_product_schema_1.SupplierType.PRINTIFY:
                return 'https://api.printify.com';
            case supplier_product_schema_1.SupplierType.CLOUD_PRINT:
                return 'https://api.cloudprint.com';
            case supplier_product_schema_1.SupplierType.RIP_PRINT:
                return 'https://api.ripprint.com';
            default:
                return '';
        }
    }
};
exports.PrintOnDemandPricingService = PrintOnDemandPricingService;
exports.PrintOnDemandPricingService = PrintOnDemandPricingService = PrintOnDemandPricingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(supplier_product_schema_1.SupplierProduct.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PrintOnDemandPricingService);
//# sourceMappingURL=print-on-demand-pricing.service.js.map