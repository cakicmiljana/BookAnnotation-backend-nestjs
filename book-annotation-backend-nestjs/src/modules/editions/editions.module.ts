import { Module } from '@nestjs/common';
import { EditionUploadService } from './edition-upload.service';
import { EditionsController } from './editions.controller';
import { EditionsService } from './editions.service';

@Module({
  controllers: [EditionsController],
  providers: [EditionsService, EditionUploadService],
  exports: [EditionsService],
})
export class EditionsModule {}
