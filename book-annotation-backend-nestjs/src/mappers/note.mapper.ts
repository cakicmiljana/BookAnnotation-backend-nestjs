import { GetNotebookNotesResponse } from '../dtos/notes/get-notebook-notes.response';
import { GetNoteResponse } from '../dtos/notes/get-note.response';
import { Note } from '../models/note';
import { toEditionSummaryResponse } from './edition.mapper';

export const toNoteResponse = (note: Note): GetNoteResponse => ({
  id: note.id,
  editionId: note.editionId,
  userId: note.userId,
  content: note.content,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
});

export const toNotebookNoteResponse = (note: Note): GetNotebookNotesResponse => ({
  ...toNoteResponse(note),
  edition: toEditionSummaryResponse(note.edition),
});
