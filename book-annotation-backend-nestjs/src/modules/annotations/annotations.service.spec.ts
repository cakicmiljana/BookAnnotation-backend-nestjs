import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Annotation } from '../../models/annotation';
import { AnnotationColor } from '../../models/enums/annotation-color.enum';
import { EditionsService } from '../editions/editions.service';
import { AnnotationsService } from './annotations.service';

const CONTENT_LENGTH = 1000;

const annotationsRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn((annotation: Partial<Annotation>) => annotation),
  save: jest.fn((annotation: Annotation) =>
    Promise.resolve({
      ...annotation,
      id: annotation.id ?? 1,
      createdAt: new Date('2026-11-24T10:00:00.000Z'),
      updatedAt: new Date('2026-11-24T10:00:00.000Z'),
    }),
  ),
  softDelete: jest.fn(),
};

const editionsService = {
  findAccessibleEdition: jest.fn(),
};

// An annotation of user 7 on edition 1, highlighting characters 10..20.
function createStoredAnnotation(): Annotation {
  return {
    id: 5,
    userId: 7,
    editionId: 1,
    startOffset: 10,
    endOffset: 20,
    comment: '',
    tag: null,
    color: AnnotationColor.Ochre,
    createdAt: new Date('2026-11-24T09:00:00.000Z'),
    updatedAt: new Date('2026-11-24T09:00:00.000Z'),
    deletedAt: null,
  } as Annotation;
}

describe('AnnotationsService', () => {
  let service: AnnotationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    editionsService.findAccessibleEdition.mockResolvedValue({
      id: 1,
      contentLength: CONTENT_LENGTH,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnotationsService,
        {
          provide: getRepositoryToken(Annotation),
          useValue: annotationsRepository,
        },
        { provide: EditionsService, useValue: editionsService },
      ],
    }).compile();

    service = module.get<AnnotationsService>(AnnotationsService);
  });

  describe('create', () => {
    it('saves an annotation inside the text, with no tag and an empty comment by default', async () => {
      const result = await service.create(7, 1, {
        startOffset: 10,
        endOffset: 20,
        color: AnnotationColor.Blue,
      });

      expect(result).toMatchObject({
        userId: 7,
        editionId: 1,
        startOffset: 10,
        endOffset: 20,
        tag: null,
        comment: '',
      });
    });

    it('rejects endOffset not greater than startOffset', async () => {
      await expect(
        service.create(7, 1, {
          startOffset: 20,
          endOffset: 20,
          color: AnnotationColor.Blue,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(annotationsRepository.save).not.toHaveBeenCalled();
    });

    it('rejects endOffset past the end of the text', async () => {
      await expect(
        service.create(7, 1, {
          startOffset: 10,
          endOffset: CONTENT_LENGTH + 1,
          color: AnnotationColor.Blue,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          `endOffset must not be greater than ${CONTENT_LENGTH}`,
        ),
      );
    });
  });

  describe('update', () => {
    it('checks a partial patch together with the stored other offset', async () => {
      annotationsRepository.findOneBy.mockResolvedValue(
        createStoredAnnotation(),
      );

      // Only endOffset is sent: 5 is below the stored startOffset of 10.
      await expect(service.update(7, 5, { endOffset: 5 })).rejects.toThrow(
        new BadRequestException('endOffset must be greater than startOffset'),
      );
      expect(annotationsRepository.save).not.toHaveBeenCalled();
    });

    it('saves a valid partial patch and keeps the other fields', async () => {
      annotationsRepository.findOneBy.mockResolvedValue(
        createStoredAnnotation(),
      );

      const result = await service.update(7, 5, { startOffset: 15 });

      expect(result).toMatchObject({ startOffset: 15, endOffset: 20 });
    });

    it("throws 404 for another user's annotation", async () => {
      annotationsRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(8, 5, { comment: 'hi' })).rejects.toThrow(
        new NotFoundException('Annotation 5 was not found'),
      );
      expect(annotationsRepository.findOneBy).toHaveBeenCalledWith({
        id: 5,
        userId: 8,
      });
    });
  });

  describe('remove', () => {
    it('soft-deletes the annotation', async () => {
      annotationsRepository.findOneBy.mockResolvedValue(
        createStoredAnnotation(),
      );

      await service.remove(7, 5);

      expect(annotationsRepository.softDelete).toHaveBeenCalledWith({ id: 5 });
    });

    it("throws 404 for another user's annotation and deletes nothing", async () => {
      annotationsRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(8, 5)).rejects.toThrow(NotFoundException);
      expect(annotationsRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
