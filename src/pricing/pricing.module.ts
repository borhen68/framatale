import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingEngineService } from './pricing-engine.service';
import { PricingRuleService } from './pricing-rule.service';
import { PricingController } from './pricing.controller';
import { PrintOnDemandPricingService } from './print-on-demand-pricing.service';
import { PrintOnDemandController } from './print-on-demand.controller';
import { DynamicCustomizationPricingService } from './dynamic-customization-pricing.service';
import { CustomizationController } from './customization.controller';
import { PricingRule, PricingRuleSchema } from './schemas/pricing-rule.schema';
import { SupplierProduct, SupplierProductSchema } from './schemas/supplier-product.schema';
import { CustomizationPricing, CustomizationPricingSchema } from './schemas/customization-pricing.schema';
import { ConfigurationModule } from '../configuration/configuration.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingRule.name, schema: PricingRuleSchema },
      { name: SupplierProduct.name, schema: SupplierProductSchema },
      { name: CustomizationPricing.name, schema: CustomizationPricingSchema },
    ]),
    ConfigurationModule,
    AnalyticsModule,
  ],
  controllers: [PricingController, PrintOnDemandController, CustomizationController],
  providers: [PricingEngineService, PricingRuleService, PrintOnDemandPricingService, DynamicCustomizationPricingService],
  exports: [PricingEngineService, PricingRuleService, PrintOnDemandPricingService, DynamicCustomizationPricingService],
})
export class PricingModule {}
