import { Module } from '@nestjs/common';
import { EditionsModule } from '../editions/editions.module';
import { WorksModule } from '../works/works.module';
import { EditionUploadService } from './edition-upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [EditionsModule, WorksModule],
  controllers: [UploadController],
  providers: [EditionUploadService],
})
export class UploadModule {}
