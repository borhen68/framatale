import { Module } from '@nestjs/common';
import { IntegrationTestService } from './integration-test.service';
import { TestController } from './test.controller';
import { PricingModule } from '../pricing/pricing.module';
import { CanvasModule } from '../canvas/canvas.module';

@Module({
  imports: [PricingModule, CanvasModule],
  controllers: [TestController],
  providers: [IntegrationTestService],
  exports: [IntegrationTestService],
})
export class TestModule {}
