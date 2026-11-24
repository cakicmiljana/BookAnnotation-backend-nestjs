import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';
import { EditionUploadService } from './edition-upload.service';
import { PdfTextExtractor } from './text-extraction/pdf-text.extractor';
import { PlainTextExtractor } from './text-extraction/plain-text.extractor';

const dto: UploadEditionDto = {
  title: 'Probe',
  author: 'Probe',
  language: 'English',
};

function makeFile(
  originalname: string,
  mimetype: string,
  content: string,
): Express.Multer.File {
  return {
    originalname,
    mimetype,
    buffer: Buffer.from(content),
  } as Express.Multer.File;
}

describe('EditionUploadService', () => {
  let service: EditionUploadService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EditionUploadService, PlainTextExtractor, PdfTextExtractor],
    }).compile();
    service = moduleRef.get(EditionUploadService);
  });

  it('rejects a file type other than .pdf and .txt with 415', async () => {
    const file = makeFile('book.docx', 'application/octet-stream', 'PK...');

    await expect(service.upload(1, file, dto)).rejects.toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('rejects a .pdf that does not start with %PDF- with 415', async () => {
    const file = makeFile('book.pdf', 'application/pdf', 'just some text');

    await expect(service.upload(1, file, dto)).rejects.toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('rejects a file with less than 100 characters of text with 400', async () => {
    const file = makeFile('book.txt', 'text/plain', '  \r\n Too short. \r\n');

    await expect(service.upload(1, file, dto)).rejects.toThrow(
      new BadRequestException('The file contains no readable text'),
    );
  });
});
