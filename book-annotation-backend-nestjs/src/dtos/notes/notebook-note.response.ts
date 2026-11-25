import { EditionSummaryResponse } from '../editions/edition-summary.response';
import { NoteResponse } from './note.response';

export class NotebookNoteResponse extends NoteResponse {
  edition: EditionSummaryResponse;
}
