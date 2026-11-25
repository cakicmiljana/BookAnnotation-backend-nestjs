import {
  BadRequestException,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';
import { EditionsService } from '../editions/editions.service';
import { WorksService } from '../works/works.service';
import { EditionUploadService } from './edition-upload.service';
import { PdfTextExtractor } from './text-extraction/pdf-text.extractor';
import { PlainTextExtractor } from './text-extraction/plain-text.extractor';

const dto: UploadEditionDto = {
  title: 'Probe',
  author: 'Probe',
  language: 'English',
};

const LONG_TEXT = 'A readable sentence of a test book. '.repeat(5);

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
  let manager: { create: jest.Mock; save: jest.Mock; insert: jest.Mock };
  let worksService: { findOne: jest.Mock; findOrCreate: jest.Mock };
  let editionsService: { findOne: jest.Mock };

  beforeEach(async () => {
    manager = {
      create: jest.fn((_entity, values: object) => ({ ...values })),
      save: jest.fn((edition: object) =>
        Promise.resolve({ id: 50, ...edition }),
      ),
      insert: jest.fn(),
    };
    // Runs the callback right away with the fake manager.
    const dataSource = {
      transaction: jest.fn(
        (work: (manager: EntityManager) => Promise<unknown>) =>
          work(manager as unknown as EntityManager),
      ),
    };
    worksService = {
      findOne: jest.fn(),
      findOrCreate: jest.fn().mockResolvedValue({ id: 7 }),
    };
    editionsService = { findOne: jest.fn().mockResolvedValue({ id: 50 }) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EditionUploadService,
        PlainTextExtractor,
        PdfTextExtractor,
        { provide: DataSource, useValue: dataSource },
        { provide: WorksService, useValue: worksService },
        { provide: EditionsService, useValue: editionsService },
      ],
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

  it('without workId, matches or creates the work by title + author', async () => {
    const file = makeFile('book.txt', 'text/plain', LONG_TEXT);

    await service.upload(1, file, dto);

    expect(worksService.findOrCreate).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({ title: 'Probe', author: 'Probe' }),
    );
    expect(manager.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ workId: 7, uploadedByUserId: 1 }),
    );
    expect(manager.insert).toHaveBeenCalledWith(expect.anything(), {
      userId: 1,
      editionId: 50,
    });
  });

  it('with workId, uses that work and does not look up title + author', async () => {
    const file = makeFile('book.txt', 'text/plain', LONG_TEXT);

    await service.upload(1, file, { language: 'English', workId: 3 });

    expect(worksService.findOne).toHaveBeenCalledWith(1, 3);
    expect(worksService.findOrCreate).not.toHaveBeenCalled();
    expect(manager.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ workId: 3 }),
    );
  });

  it('with a workId the user cannot see, returns 404 and saves nothing', async () => {
    worksService.findOne.mockRejectedValue(new NotFoundException());
    const file = makeFile('book.txt', 'text/plain', LONG_TEXT);

    await expect(
      service.upload(1, file, { language: 'English', workId: 99 }),
    ).rejects.toThrow(NotFoundException);
    expect(manager.save).not.toHaveBeenCalled();
  });
});
