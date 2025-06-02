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
var CostPlusPricingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostPlusPricingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_cost_schema_1 = require("./schemas/product-cost.schema");
let CostPlusPricingService = CostPlusPricingService_1 = class CostPlusPricingService {
    productCostModel;
    logger = new common_1.Logger(CostPlusPricingService_1.name);
    constructor(productCostModel) {
        this.productCostModel = productCostModel;
    }
    async calculateCostPlusPrice(request) {
        const productCost = await this.getProductCost(request);
        if (!productCost) {
            throw new Error(`Cost information not found for product: ${request.productType}`);
        }
        const unitCost = this.calculateVolumeCost(productCost, request.quantity);
        const costBreakdown = this.calculateCostBreakdown(productCost, unitCost, request.quantity);
        const profitAnalysis = this.analyzeProfitability(costBreakdown, request.quantity);
        const recommendations = this.generateRecommendations(costBreakdown, profitAnalysis, productCost);
        return {
            costBreakdown,
            profitAnalysis,
            recommendations,
        };
    }
    async createProductCost(costData) {
        const totalCost = costData.costs.baseCost +
            costData.costs.shippingCost +
            costData.costs.handlingFee +
            costData.costs.qualityControlCost +
            costData.costs.packagingCost;
        const recommendedPrice = totalCost / (1 - costData.pricing.targetMargin / 100);
        const productCost = new this.productCostModel({
            ...costData,
            costs: {
                ...costData.costs,
                totalCost,
            },
            pricing: {
                ...costData.pricing,
                recommendedPrice,
            },
            validFrom: new Date(),
            metadata: {
                currency: 'USD',
                lastUpdated: new Date(),
                updatedBy: 'system',
            },
        });
        return productCost.save();
    }
    async createPhotoBookCost() {
        return this.createProductCost({
            productType: 'photo_book',
            variant: 'standard_8x8',
            supplier: {
                supplierId: 'supplier_001',
                supplierName: 'Premium Print Co',
                supplierSku: 'PB-8X8-STD',
                minimumOrderQuantity: 10,
                leadTime: 5,
                qualityRating: 4.5,
            },
            costs: {
                baseCost: 4.00,
                shippingCost: 0.50,
                handlingFee: 0.25,
                qualityControlCost: 0.15,
                packagingCost: 0.10,
            },
            pricing: {
                targetSellingPrice: 22.00,
                targetMargin: 77.27,
                minimumMargin: 60.00,
            },
            volumeTiers: [
                { minQuantity: 1, maxQuantity: 9, unitCost: 5.00, discount: 0 },
                { minQuantity: 10, maxQuantity: 49, unitCost: 4.75, discount: 5 },
                { minQuantity: 50, maxQuantity: 99, unitCost: 4.50, discount: 10 },
                { minQuantity: 100, unitCost: 4.25, discount: 15 },
            ],
        });
    }
    async updateSupplierCosts(productType, newCosts) {
        const productCost = await this.productCostModel
            .findOne({ productType, isActive: true })
            .exec();
        if (!productCost) {
            throw new Error(`Product cost not found for: ${productType}`);
        }
        if (newCosts.baseCost !== undefined) {
            productCost.costs.baseCost = newCosts.baseCost;
        }
        if (newCosts.shippingCost !== undefined) {
            productCost.costs.shippingCost = newCosts.shippingCost;
        }
        if (newCosts.handlingFee !== undefined) {
            productCost.costs.handlingFee = newCosts.handlingFee;
        }
        productCost.costs.totalCost =
            productCost.costs.baseCost +
                productCost.costs.shippingCost +
                productCost.costs.handlingFee +
                productCost.costs.qualityControlCost +
                productCost.costs.packagingCost;
        productCost.pricing.recommendedPrice =
            productCost.costs.totalCost / (1 - productCost.pricing.targetMargin / 100);
        productCost.metadata.lastUpdated = new Date();
        return productCost.save();
    }
    async getProfitabilityReport(productType, timeRange) {
        const productCost = await this.getProductCost({ productType, quantity: 1 });
        const mockSalesData = {
            unitsSold: 150,
            totalRevenue: 3300,
            totalCosts: 750,
        };
        const totalProfit = mockSalesData.totalRevenue - mockSalesData.totalCosts;
        const profitMargin = (totalProfit / mockSalesData.totalRevenue) * 100;
        return {
            totalRevenue: mockSalesData.totalRevenue,
            totalCosts: mockSalesData.totalCosts,
            totalProfit,
            profitMargin,
            unitsSold: mockSalesData.unitsSold,
            averageSellingPrice: mockSalesData.totalRevenue / mockSalesData.unitsSold,
            averageCost: mockSalesData.totalCosts / mockSalesData.unitsSold,
            recommendations: [
                profitMargin > 75 ? 'Excellent profit margin! Consider expanding this product line.' : 'Consider optimizing costs or increasing prices.',
                'Monitor competitor pricing to ensure competitiveness.',
                'Negotiate better rates with suppliers for higher volumes.',
            ],
        };
    }
    async getProductCost(request) {
        const query = {
            productType: request.productType,
            isActive: true,
        };
        if (request.variant) {
            query.variant = request.variant;
        }
        if (request.supplierId) {
            query['supplier.supplierId'] = request.supplierId;
        }
        return this.productCostModel.findOne(query).exec();
    }
    calculateVolumeCost(productCost, quantity) {
        if (!productCost.volumeTiers || productCost.volumeTiers.length === 0) {
            return productCost.costs.totalCost;
        }
        const applicableTier = productCost.volumeTiers.find(tier => quantity >= tier.minQuantity &&
            (!tier.maxQuantity || quantity <= tier.maxQuantity));
        return applicableTier ? applicableTier.unitCost : productCost.costs.totalCost;
    }
    calculateCostBreakdown(productCost, unitCost, quantity) {
        const cogs = unitCost;
        const sellingPrice = productCost.pricing.targetSellingPrice;
        const markup = sellingPrice - cogs;
        const markupPercentage = (markup / cogs) * 100;
        const margin = sellingPrice - cogs;
        const marginPercentage = (margin / sellingPrice) * 100;
        return {
            cogs,
            markup,
            markupPercentage,
            sellingPrice,
            margin,
            marginPercentage,
        };
    }
    analyzeProfitability(costBreakdown, quantity) {
        const unitProfit = costBreakdown.margin;
        const totalProfit = unitProfit * quantity;
        const roi = (unitProfit / costBreakdown.cogs) * 100;
        const fixedCosts = 1000;
        const breakEvenQuantity = Math.ceil(fixedCosts / unitProfit);
        const recommendedPrice = costBreakdown.cogs * 4.5;
        return {
            unitProfit,
            totalProfit,
            roi,
            breakEvenQuantity,
            recommendedPrice,
        };
    }
    generateRecommendations(costBreakdown, profitAnalysis, productCost) {
        const recommendations = [];
        if (costBreakdown.marginPercentage > 80) {
            recommendations.push('Excellent margin! Consider this as a premium product.');
        }
        else if (costBreakdown.marginPercentage > 60) {
            recommendations.push('Good margin. Monitor competitor pricing.');
        }
        else if (costBreakdown.marginPercentage > 40) {
            recommendations.push('Acceptable margin. Look for cost optimization opportunities.');
        }
        else {
            recommendations.push('Low margin. Consider increasing price or reducing costs.');
        }
        if (productCost.volumeTiers && productCost.volumeTiers.length > 0) {
            recommendations.push('Volume discounts available. Promote bulk orders to increase profitability.');
        }
        if (productCost.pricing.competitorPrice) {
            const competitorDiff = ((costBreakdown.sellingPrice - productCost.pricing.competitorPrice) / productCost.pricing.competitorPrice) * 100;
            if (competitorDiff > 10) {
                recommendations.push('Price is 10%+ above competitors. Consider price adjustment or value justification.');
            }
            else if (competitorDiff < -10) {
                recommendations.push('Price is 10%+ below competitors. Opportunity for price increase.');
            }
            else {
                recommendations.push('Price is competitive with market rates.');
            }
        }
        if (profitAnalysis.roi > 300) {
            recommendations.push('Excellent ROI! Consider expanding production capacity.');
        }
        else if (profitAnalysis.roi < 100) {
            recommendations.push('Low ROI. Review cost structure and pricing strategy.');
        }
        return recommendations;
    }
};
exports.CostPlusPricingService = CostPlusPricingService;
exports.CostPlusPricingService = CostPlusPricingService = CostPlusPricingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_cost_schema_1.ProductCost.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CostPlusPricingService);
//# sourceMappingURL=cost-plus-pricing.service.js.map