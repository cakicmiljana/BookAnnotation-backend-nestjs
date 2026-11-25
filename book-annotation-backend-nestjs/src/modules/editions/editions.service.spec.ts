import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EditionSort } from '../../dtos/editions/edition-sort.enum';
import { Edition } from '../../models/edition';
import { SourceFormat } from '../../models/enums/source-format.enum';
import { EditionsService } from './editions.service';

// A fake query builder: every method returns itself, except getOne and
// getMany, whose results each test decides. The real SQL is checked by the e2e tests.
const queryBuilder = {
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
  getMany: jest.fn(),
};

const editionsRepository = {
  createQueryBuilder: jest.fn(() => queryBuilder),
  findOneOrFail: jest.fn(),
};

function createGatsby(): Edition {
  return {
    id: 1,
    workId: 1,
    work: {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'Wealth, illusion, and the American Dream.',
      country: 'USA',
      originalLanguage: 'English',
      publicationYear: 1925,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    language: 'English',
    isbn: null,
    pages: 218,
    pageSize: 1200,
    content: undefined as unknown as string,
    contentLength: 56674,
    sourceFormat: SourceFormat.Txt,
    coverUrl: null,
    uploadedByUserId: null,
    uploadedByUser: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  };
}

describe('EditionsService', () => {
  let service: EditionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditionsService,
        { provide: getRepositoryToken(Edition), useValue: editionsRepository },
      ],
    }).compile();

    service = module.get<EditionsService>(EditionsService);
  });

  describe('findAccessibleOrFail', () => {
    it('returns a catalogue edition (no uploader)', async () => {
      const catalogueEdition = { id: 1, uploadedByUserId: null };
      queryBuilder.getOne.mockResolvedValue(catalogueEdition);

      await expect(service.findAccessibleEdition(1, 7)).resolves.toBe(
        catalogueEdition,
      );
    });

    it("returns the user's own upload", async () => {
      const ownUpload = { id: 4, uploadedByUserId: 7 };
      queryBuilder.getOne.mockResolvedValue(ownUpload);

      await expect(service.findAccessibleEdition(4, 7)).resolves.toBe(
        ownUpload,
      );
    });

    it("throws 404 for another user's upload, the same as for a missing edition", async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findAccessibleEdition(4, 8)).rejects.toThrow(
        new NotFoundException('Edition 4 was not found'),
      );
    });

    it('applies the visibility rule and loads the work', async () => {
      queryBuilder.getOne.mockResolvedValue({ id: 1 });

      await service.findAccessibleEdition(1, 7);

      expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'edition.work',
        'work',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        '(edition.uploadedByUserId IS NULL OR edition.uploadedByUserId = :userId)',
        { userId: 7 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'edition.id = :editionId',
        { editionId: 1 },
      );
    });
  });

  describe('findAllAccessible', () => {
    it('returns the accessible editions as frontend Books, sorted by title', async () => {
      queryBuilder.getMany.mockResolvedValue([createGatsby()]);

      const books = await service.findAllAccessible(7, {
        sort: EditionSort.Title,
      });

      expect(books).toHaveLength(1);
      expect(books[0]).toMatchObject({
        id: 1,
        title: 'The Great Gatsby',
        uploadedByMe: false,
      });
      expect(queryBuilder.orderBy).not.toHaveBeenCalled();
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('work.title', 'ASC');
    });

    it('searches title and author case-insensitively when q is given', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.findAllAccessible(7, {
        q: 'gatsby',
        sort: EditionSort.Title,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(work.title ILIKE :search OR work.author ILIKE :search)',
        { search: '%gatsby%' },
      );
    });

    it('treats % and _ in the search text literally', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.findAllAccessible(7, {
        q: '50%_off',
        sort: EditionSort.Title,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.any(String), {
        search: '%50\\%\\_off%',
      });
    });

    it('does not filter when q is not given', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.findAllAccessible(7, { sort: EditionSort.Title });

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('sorts by author', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.findAllAccessible(7, { sort: EditionSort.Author });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('work.author', 'ASC');
    });

    it('sorts by year, with unknown years last', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.findAllAccessible(7, { sort: EditionSort.Year });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'work.publicationYear',
        'ASC',
        'NULLS LAST',
      );
    });
  });

  describe('findOne', () => {
    it('returns one accessible edition as a frontend Book', async () => {
      queryBuilder.getOne.mockResolvedValue(createGatsby());

      await expect(service.findOne(7, 1)).resolves.toMatchObject({
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
      });
    });

    it('throws 404 when the edition is missing or not accessible', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne(7, 99)).rejects.toThrow(
        new NotFoundException('Edition 99 was not found'),
      );
    });
  });

  describe('getContent', () => {
    it('returns the full text with the paging information', async () => {
      queryBuilder.getOne.mockResolvedValue(createGatsby());
      editionsRepository.findOneOrFail.mockResolvedValue({
        id: 1,
        content: 'In my younger and more vulnerable years...',
      });

      await expect(service.getContent(7, 1)).resolves.toEqual({
        editionId: 1,
        content: 'In my younger and more vulnerable years...',
        contentLength: 56674,
        pageSize: 1200,
      });
    });

    it('checks access first and never loads the text of an inaccessible edition', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await expect(service.getContent(8, 4)).rejects.toThrow(NotFoundException);
      expect(editionsRepository.findOneOrFail).not.toHaveBeenCalled();
    });
  });
});
