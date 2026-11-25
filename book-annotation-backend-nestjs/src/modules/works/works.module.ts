import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Work } from '../../models/work';
import { EditionsModule } from '../editions/editions.module';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';

@Module({
  imports: [TypeOrmModule.forFeature([Work]), EditionsModule],
  controllers: [WorksController],
  providers: [WorksService],
  exports: [WorksService],
})
export class WorksModule {}
