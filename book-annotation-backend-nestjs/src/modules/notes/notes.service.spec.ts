import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Note } from '../../models/note';
import { EditionsService } from '../editions/editions.service';
import { NotesService } from './notes.service';

const notesRepository = {
  findOneBy: jest.fn(),
  // Returns a copy, so the service's later changes do not alter the recorded call.
  create: jest.fn((note: Partial<Note>) => ({ ...note })),
  save: jest.fn((note: Note) =>
    Promise.resolve({
      ...note,
      id: note.id ?? 1,
      createdAt: note.createdAt ?? new Date('2026-11-24T10:00:00.000Z'),
      updatedAt: new Date('2026-11-24T11:00:00.000Z'),
    }),
  ),
};

const editionsService = {
  findAccessibleEdition: jest.fn(),
};

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    editionsService.findAccessibleEdition.mockResolvedValue({ id: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: getRepositoryToken(Note), useValue: notesRepository },
        { provide: EditionsService, useValue: editionsService },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  describe('upsert', () => {
    it('creates the note when the user has none for this edition', async () => {
      notesRepository.findOneBy.mockResolvedValue(null);

      const result = await service.upsert(7, 1, { content: 'First thoughts' });

      expect(notesRepository.create).toHaveBeenCalledWith({
        userId: 7,
        editionId: 1,
      });
      expect(result).toMatchObject({
        id: 1,
        userId: 7,
        editionId: 1,
        content: 'First thoughts',
      });
    });

    it('updates the same row on the next call', async () => {
      notesRepository.findOneBy.mockResolvedValue({
        id: 1,
        userId: 7,
        editionId: 1,
        content: 'First thoughts',
        createdAt: new Date('2026-11-24T10:00:00.000Z'),
      });

      const result = await service.upsert(7, 1, { content: 'Second draft' });

      expect(notesRepository.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1, content: 'Second draft' });
    });
  });

  describe('findOne', () => {
    it('returns null when the user has no note yet (the controller answers 204)', async () => {
      notesRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findNote(7, 1)).resolves.toBeNull();
    });
  });
});
