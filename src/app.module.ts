import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { MediaModule } from './media/media.module';
import { ImageAnalyzerModule } from './image-analyzer/image-analyzer.module';
import { MetadataModule } from './metadata/metadata.module';
import { LayoutModule } from './layout/layout.module';
import { AIEnhancementModule } from './ai-enhancement/ai-enhancement.module';
import { ExportModule } from './export/export.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notification/notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportingModule } from './reporting/reporting.module';
import { ComplianceModule } from './compliance/compliance.module';
import { LocalizationModule } from './localization/localization.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { PricingModule } from './pricing/pricing.module';
import { CanvasModule } from './canvas/canvas.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/frametale',
      }),
    }),
    AuthModule,
    UserModule,
    ProjectModule,
    MediaModule,
    ImageAnalyzerModule,
    MetadataModule,
    LayoutModule,
    AIEnhancementModule,
    ExportModule,
    OrderModule,
    NotificationModule,
    AnalyticsModule,
    ReportingModule,
    ComplianceModule,
    LocalizationModule,
    ConfigurationModule,
    PricingModule,
    CanvasModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
