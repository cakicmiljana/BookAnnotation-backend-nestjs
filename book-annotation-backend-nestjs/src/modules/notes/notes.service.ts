import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { escapeLikePattern } from '../../common/utils/escape-like-pattern';
import { NotebookSearchQueryDto } from '../../dtos/common/notebook-search-query.dto';
import { NotebookNoteResponse } from '../../dtos/notes/notebook-note.response';
import { NoteResponse } from '../../dtos/notes/note.response';
import { UpsertNoteDto } from '../../dtos/notes/upsert-note.dto';
import {
  toNotebookNoteResponse,
  toNoteResponse,
} from '../../mappers/note.mapper';
import { Note } from '../../models/note';
import { EditionsService } from '../editions/editions.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly editionsService: EditionsService,
  ) {}

  async findNote(userId: number, editionId: number): Promise<NoteResponse | null> {
    await this.editionsService.findAccessibleEdition(editionId, userId);

    const note = await this.notesRepository.findOneBy({ userId, editionId });
    return note ? toNoteResponse(note) : null;
  }

  // One note per user and edition: the first call creates it, later calls
  // update the same row.
  async upsert(
    userId: number,
    editionId: number,
    dto: UpsertNoteDto,
  ): Promise<NoteResponse> {
    await this.editionsService.findAccessibleEdition(editionId, userId);

    const existing = await this.notesRepository.findOneBy({
      userId,
      editionId,
    });
    const note = existing ?? this.notesRepository.create({ userId, editionId });
    note.content = dto.content;

    const saved = await this.notesRepository.save(note);
    return toNoteResponse(saved);
  }

  async remove(userId: number, editionId: number): Promise<void> {
    await this.editionsService.findAccessibleEdition(editionId, userId);
    await this.notesRepository.delete({ userId, editionId });
  }

  // all the user's notes, the most recently changed first.
  // `q` searches the note text and the book's title and author.
  async findForNotebook(
    userId: number,
    query: NotebookSearchQueryDto,
  ): Promise<NotebookNoteResponse[]> {
    const notesQuery = this.notesRepository
      .createQueryBuilder('note')
      .innerJoinAndSelect('note.edition', 'edition')
      .innerJoinAndSelect('edition.work', 'work')
      .where('note.userId = :userId', { userId });

    if (query.q) {
      notesQuery.andWhere(
        '(note.content ILIKE :search OR work.title ILIKE :search OR work.author ILIKE :search)',
        { search: `%${escapeLikePattern(query.q)}%` },
      );
    }

    const notes = await notesQuery.orderBy('note.updatedAt', 'DESC').getMany();
    return notes.map(toNotebookNoteResponse);
  }
}
