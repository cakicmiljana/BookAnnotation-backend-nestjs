import { AnnotationResponse } from '../dtos/annotations/annotation.response';
import { NotebookAnnotationResponse } from '../dtos/annotations/notebook-annotation.response';
import { Annotation } from '../models/annotation';
import { toEditionSummaryResponse } from './edition.mapper';

export const toAnnotationResponse = (
  annotation: Annotation,
): AnnotationResponse => ({
  id: annotation.id,
  editionId: annotation.editionId,
  userId: annotation.userId,
  startOffset: annotation.startOffset,
  endOffset: annotation.endOffset,
  comment: annotation.comment,
  tag: annotation.tag,
  color: annotation.color,
  createdAt: annotation.createdAt.toISOString(),
  updatedAt: annotation.updatedAt.toISOString(),
});

// The annotation must be loaded with its edition and work.
export const toNotebookAnnotationResponse = (
  annotation: Annotation,
  excerpt: string,
): NotebookAnnotationResponse => ({
  ...toAnnotationResponse(annotation),
  excerpt,
  edition: toEditionSummaryResponse(annotation.edition),
});
