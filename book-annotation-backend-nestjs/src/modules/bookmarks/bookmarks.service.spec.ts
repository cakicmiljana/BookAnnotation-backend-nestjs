import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bookmark } from '../../models/bookmark';
import { EditionsService } from '../editions/editions.service';
import { BookmarksService } from './bookmarks.service';

const bookmarksRepository = {
  findOneBy: jest.fn(),
  create: jest.fn((bookmark: Partial<Bookmark>) => ({ ...bookmark })),
  save: jest.fn((bookmark: Bookmark) =>
    Promise.resolve({
      ...bookmark,
      id: 2,
      createdAt: new Date('2026-11-24T12:00:00.000Z'),
    }),
  ),
};

const editionsService = {
  findAccessibleEdition: jest.fn(),
};

describe('BookmarksService', () => {
  let service: BookmarksService;

  beforeEach(async () => {
    jest.clearAllMocks();
    editionsService.findAccessibleEdition.mockResolvedValue({
      id: 1,
      contentLength: 10000,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        {
          provide: getRepositoryToken(Bookmark),
          useValue: bookmarksRepository,
        },
        { provide: EditionsService, useValue: editionsService },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
  });

  describe('create', () => {
    it('returns the existing bookmark for a duplicate offset, without saving a new one', async () => {
      bookmarksRepository.findOneBy.mockResolvedValue({
        id: 1,
        userId: 7,
        editionId: 1,
        offset: 3000,
        label: 'Chapter II',
        createdAt: new Date('2026-11-20T09:00:00.000Z'),
      });

      const result = await service.create(7, 1, { offset: 3000 });

      expect(result).toMatchObject({ id: 1, label: 'Chapter II' });
      expect(bookmarksRepository.save).not.toHaveBeenCalled();
    });

    it('saves a new bookmark when there is none at this offset', async () => {
      bookmarksRepository.findOneBy.mockResolvedValue(null);

      const result = await service.create(7, 1, { offset: 3000 });

      expect(result).toMatchObject({ id: 2, offset: 3000, label: null });
      expect(bookmarksRepository.save).toHaveBeenCalled();
    });
  });
});
