import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { NotebookSearchQueryDto } from '../../dtos/common/notebook-search-query.dto';
import { NotebookNoteResponse } from '../../dtos/notes/notebook-note.response';
import { NoteResponse } from '../../dtos/notes/note.response';
import { UpsertNoteDto } from '../../dtos/notes/upsert-note.dto';

@Injectable()
export class NotesService {
  /** `null` when the user has no note for this edition yet. */
  findOne(userId: number, editionId: number): Promise<NoteResponse | null> {
    return notImplemented(userId, editionId);
  }

  /** Creates or updates the single note for (user, edition). */
  upsert(
    userId: number,
    editionId: number,
    dto: UpsertNoteDto,
  ): Promise<NoteResponse> {
    return notImplemented(userId, editionId, dto);
  }

  remove(userId: number, editionId: number): Promise<void> {
    return notImplemented(userId, editionId);
  }

  /** Ordered by updatedAt DESC. */
  findForNotebook(
    userId: number,
    query: NotebookSearchQueryDto,
  ): Promise<NotebookNoteResponse[]> {
    return notImplemented(userId, query);
  }
}
