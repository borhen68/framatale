"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pricing_engine_service_1 = require("./pricing-engine.service");
const pricing_rule_service_1 = require("./pricing-rule.service");
const pricing_controller_1 = require("./pricing.controller");
const print_on_demand_pricing_service_1 = require("./print-on-demand-pricing.service");
const print_on_demand_controller_1 = require("./print-on-demand.controller");
const dynamic_customization_pricing_service_1 = require("./dynamic-customization-pricing.service");
const customization_controller_1 = require("./customization.controller");
const pricing_rule_schema_1 = require("./schemas/pricing-rule.schema");
const supplier_product_schema_1 = require("./schemas/supplier-product.schema");
const customization_pricing_schema_1 = require("./schemas/customization-pricing.schema");
const configuration_module_1 = require("../configuration/configuration.module");
const analytics_module_1 = require("../analytics/analytics.module");
let PricingModule = class PricingModule {
};
exports.PricingModule = PricingModule;
exports.PricingModule = PricingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: pricing_rule_schema_1.PricingRule.name, schema: pricing_rule_schema_1.PricingRuleSchema },
                { name: supplier_product_schema_1.SupplierProduct.name, schema: supplier_product_schema_1.SupplierProductSchema },
                { name: customization_pricing_schema_1.CustomizationPricing.name, schema: customization_pricing_schema_1.CustomizationPricingSchema },
            ]),
            configuration_module_1.ConfigurationModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [pricing_controller_1.PricingController, print_on_demand_controller_1.PrintOnDemandController, customization_controller_1.CustomizationController],
        providers: [pricing_engine_service_1.PricingEngineService, pricing_rule_service_1.PricingRuleService, print_on_demand_pricing_service_1.PrintOnDemandPricingService, dynamic_customization_pricing_service_1.DynamicCustomizationPricingService],
        exports: [pricing_engine_service_1.PricingEngineService, pricing_rule_service_1.PricingRuleService, print_on_demand_pricing_service_1.PrintOnDemandPricingService, dynamic_customization_pricing_service_1.DynamicCustomizationPricingService],
    })
], PricingModule);
//# sourceMappingURL=pricing.module.js.map