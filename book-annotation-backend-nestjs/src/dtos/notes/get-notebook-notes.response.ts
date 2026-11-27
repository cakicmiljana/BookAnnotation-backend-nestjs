import { EditionSummaryResponse } from '../editions/edition-summary.response';
import { GetNoteResponse } from './get-note.response';

export class GetNotebookNotesResponse extends GetNoteResponse {
  edition: EditionSummaryResponse;
}
