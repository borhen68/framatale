"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const reporting_service_1 = require("./reporting.service");
const reporting_controller_1 = require("./reporting.controller");
const report_schema_1 = require("./schemas/report.schema");
const analytics_module_1 = require("../analytics/analytics.module");
const order_module_1 = require("../order/order.module");
const user_module_1 = require("../user/user.module");
let ReportingModule = class ReportingModule {
};
exports.ReportingModule = ReportingModule;
exports.ReportingModule = ReportingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: report_schema_1.Report.name, schema: report_schema_1.ReportSchema }]),
            schedule_1.ScheduleModule.forRoot(),
            analytics_module_1.AnalyticsModule,
            order_module_1.OrderModule,
            user_module_1.UserModule,
        ],
        controllers: [reporting_controller_1.ReportingController],
        providers: [reporting_service_1.ReportingService],
        exports: [reporting_service_1.ReportingService],
    })
], ReportingModule);
//# sourceMappingURL=reporting.module.js.map