import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edition } from '../../models/edition';
import { EditionsController } from './editions.controller';
import { EditionsService } from './editions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edition])],
  controllers: [EditionsController],
  providers: [EditionsService],
  exports: [EditionsService],
})
export class EditionsModule {}
