import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EnvironmentVariables } from '../../config/env.validation';
import { EditionsModule } from '../editions/editions.module';
import { WorksModule } from '../works/works.module';
import { EditionUploadService } from './edition-upload.service';
import { PdfTextExtractor } from './text-extraction/pdf-text.extractor';
import { PlainTextExtractor } from './text-extraction/plain-text.extractor';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    // Files stay in memory only; a bigger file is rejected with 413.
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        storage: memoryStorage(),
        limits: { fileSize: config.get('UPLOAD_MAX_BYTES', { infer: true }) },
      }),
    }),
    EditionsModule,
    WorksModule,
  ],
  controllers: [UploadController],
  providers: [EditionUploadService, PlainTextExtractor, PdfTextExtractor],
})
export class UploadModule {}
