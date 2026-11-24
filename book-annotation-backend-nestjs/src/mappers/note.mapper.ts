import { NotebookNoteResponse } from '../dtos/notes/notebook-note.response';
import { NoteResponse } from '../dtos/notes/note.response';
import { Note } from '../models/note';
import { toEditionSummaryResponse } from './edition.mapper';

export const toNoteResponse = (note: Note): NoteResponse => ({
  id: note.id,
  editionId: note.editionId,
  userId: note.userId,
  content: note.content,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
});

// The note must be loaded with its edition and work.
export const toNotebookNoteResponse = (note: Note): NotebookNoteResponse => ({
  ...toNoteResponse(note),
  edition: toEditionSummaryResponse(note.edition),
});
