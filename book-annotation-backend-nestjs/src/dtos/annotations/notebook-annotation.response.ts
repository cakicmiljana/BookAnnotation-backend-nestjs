import { EditionSummaryResponse } from '../editions/edition-summary.response';
import { AnnotationResponse } from './annotation.response';

export class NotebookAnnotationResponse extends AnnotationResponse {
  excerpt: string;
  edition: EditionSummaryResponse;
}
