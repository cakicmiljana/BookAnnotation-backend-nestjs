import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edition } from '../../models/edition';
import { EditionUploadService } from './edition-upload.service';
import { EditionsController } from './editions.controller';
import { EditionsService } from './editions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edition])],
  controllers: [EditionsController],
  providers: [EditionsService, EditionUploadService],
  exports: [EditionsService],
})
export class EditionsModule {}
