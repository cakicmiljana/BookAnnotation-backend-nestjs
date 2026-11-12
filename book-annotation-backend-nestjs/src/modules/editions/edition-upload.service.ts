import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';

@Injectable()
export class EditionUploadService {
  /** Validates and extracts the file, resolves the work, then creates the edition and library entry in one transaction. */
  upload(
    userId: number,
    file: Express.Multer.File,
    dto: UploadEditionDto,
  ): Promise<EditionResponse> {
    return notImplemented(userId, file, dto);
  }
}
