import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { normalizeText } from '../../common/utils/normalize-text';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';
import { Edition } from '../../models/edition';
import { SourceFormat } from '../../models/enums/source-format.enum';
import { LibraryEntry } from '../../models/library-entry';
import { EditionsService } from '../editions/editions.service';
import { WorksService } from '../works/works.service';
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
    private readonly dataSource: DataSource,
    private readonly worksService: WorksService,
    private readonly editionsService: EditionsService,
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

    // An existing work must be one the user can see (404 otherwise).
    if (dto.workId !== undefined) {
      await this.worksService.findOne(userId, dto.workId);
    }

    // Everything inside is saved together, or not at all.
    const editionId = await this.dataSource.transaction(async (manager) => {
      const workId = await this.resolveWorkId(manager, dto);
      const edition = await this.createEdition(manager, {
        userId,
        workId,
        dto,
        extracted,
        sourceFormat,
      });
      await manager.insert(LibraryEntry, { userId, editionId: edition.id });
      return edition.id;
    });

    return this.editionsService.findOne(userId, editionId);
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

  private async resolveWorkId(
    manager: EntityManager,
    dto: UploadEditionDto,
  ): Promise<number> {
    if (dto.workId !== undefined) {
      return dto.workId;
    }
    // UploadEditionDto requires title and author when workId is missing.
    const work = await this.worksService.findOrCreate(manager, {
      title: dto.title!,
      author: dto.author!,
      description: dto.description,
      country: dto.country,
      publicationYear: dto.publicationYear,
    });
    return work.id;
  }

  private createEdition(
    manager: EntityManager,
    input: {
      userId: number;
      workId: number;
      dto: UploadEditionDto;
      extracted: ExtractedText;
      sourceFormat: SourceFormat;
    },
  ): Promise<Edition> {
    const edition = manager.create(Edition, {
      workId: input.workId,
      language: input.dto.language,
      isbn: input.dto.isbn ?? null,
      pages: input.extracted.pages,
      content: input.extracted.text,
      contentLength: input.extracted.text.length,
      sourceFormat: input.sourceFormat,
      uploadedByUserId: input.userId,
    });
    return manager.save(edition);
  }
}
