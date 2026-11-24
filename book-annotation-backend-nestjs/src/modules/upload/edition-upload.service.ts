import { BadRequestException, Injectable } from '@nestjs/common';
import { normalizeText } from '../../common/utils/normalize-text';
import { notImplemented } from '../../common/utils/not-implemented';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';
import { SourceFormat } from '../../models/enums/source-format.enum';
import { detectSourceFormat } from './detect-source-format';
import { PdfTextExtractor } from './text-extraction/pdf-text.extractor';
import { PlainTextExtractor } from './text-extraction/plain-text.extractor';
import {
  ExtractedText,
  TextExtractor,
} from './text-extraction/text-extractor.interface';

// Shorter texts are almost always a scanned PDF or an empty file.
const MIN_TEXT_LENGTH = 100;

@Injectable()
export class EditionUploadService {
  constructor(
    private readonly plainTextExtractor: PlainTextExtractor,
    private readonly pdfTextExtractor: PdfTextExtractor,
  ) {}

  /** Validates and extracts the file, resolves the work, then creates the edition and library entry in one transaction. */
  async upload(
    userId: number,
    file: Express.Multer.File | undefined,
    dto: UploadEditionDto,
  ): Promise<EditionResponse> {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    const sourceFormat = detectSourceFormat(file);
    const extracted = await this.extractText(file, sourceFormat);

    // TODO (step 3): resolve the work, then create the edition and library entry.
    return notImplemented(userId, dto, extracted);
  }

  private async extractText(
    file: Express.Multer.File,
    sourceFormat: SourceFormat,
  ): Promise<ExtractedText> {
    const extractor = this.extractorFor(sourceFormat);
    const extracted = await extractor.extract(file.buffer);
    const text = normalizeText(extracted.text);

    if (text.length < MIN_TEXT_LENGTH) {
      throw new BadRequestException('The file contains no readable text');
    }
    return { text, pages: extracted.pages };
  }

  private extractorFor(sourceFormat: SourceFormat): TextExtractor {
    if (sourceFormat === SourceFormat.Pdf) {
      return this.pdfTextExtractor;
    }
    return this.plainTextExtractor;
  }
}
