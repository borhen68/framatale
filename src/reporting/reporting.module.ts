import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { Report, ReportSchema } from './schemas/report.schema';
import { AnalyticsModule } from '../analytics/analytics.module';
import { OrderModule } from '../order/order.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    ScheduleModule.forRoot(),
    AnalyticsModule,
    OrderModule,
    UserModule,
  ],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
