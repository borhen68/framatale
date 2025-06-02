"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const project_module_1 = require("./project/project.module");
const media_module_1 = require("./media/media.module");
const image_analyzer_module_1 = require("./image-analyzer/image-analyzer.module");
const metadata_module_1 = require("./metadata/metadata.module");
const layout_module_1 = require("./layout/layout.module");
const ai_enhancement_module_1 = require("./ai-enhancement/ai-enhancement.module");
const export_module_1 = require("./export/export.module");
const order_module_1 = require("./order/order.module");
const notification_module_1 = require("./notification/notification.module");
const analytics_module_1 = require("./analytics/analytics.module");
const reporting_module_1 = require("./reporting/reporting.module");
const compliance_module_1 = require("./compliance/compliance.module");
const localization_module_1 = require("./localization/localization.module");
const configuration_module_1 = require("./configuration/configuration.module");
const pricing_module_1 = require("./pricing/pricing.module");
const canvas_module_1 = require("./canvas/canvas.module");
const test_module_1 = require("./test/test.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: () => ({
                    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/frametale',
                }),
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            project_module_1.ProjectModule,
            media_module_1.MediaModule,
            image_analyzer_module_1.ImageAnalyzerModule,
            metadata_module_1.MetadataModule,
            layout_module_1.LayoutModule,
            ai_enhancement_module_1.AIEnhancementModule,
            export_module_1.ExportModule,
            order_module_1.OrderModule,
            notification_module_1.NotificationModule,
            analytics_module_1.AnalyticsModule,
            reporting_module_1.ReportingModule,
            compliance_module_1.ComplianceModule,
            localization_module_1.LocalizationModule,
            configuration_module_1.ConfigurationModule,
            pricing_module_1.PricingModule,
            canvas_module_1.CanvasModule,
            test_module_1.TestModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map