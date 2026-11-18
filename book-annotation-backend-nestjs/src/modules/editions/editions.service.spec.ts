import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Edition } from '../../models/edition';
import { EditionsService } from './editions.service';

// A fake query builder: every method returns itself, except getOne, whose
// result each test decides. The real SQL is checked by the e2e tests.
const queryBuilder = {
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const editionsRepository = {
  createQueryBuilder: jest.fn(() => queryBuilder),
};

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

      await expect(service.findAccessibleEdition(4, 7)).resolves.toBe(ownUpload);
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
});
