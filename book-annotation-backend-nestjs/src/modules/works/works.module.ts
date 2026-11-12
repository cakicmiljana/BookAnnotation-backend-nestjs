import { Module } from '@nestjs/common';
import { EditionsModule } from '../editions/editions.module';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';

@Module({
  imports: [EditionsModule],
  controllers: [WorksController],
  providers: [WorksService],
})
export class WorksModule {}
