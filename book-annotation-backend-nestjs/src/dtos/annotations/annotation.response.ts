import { AnnotationColor } from '../../models/enums/annotation-color.enum';
import { AnnotationTag } from '../../models/enums/annotation-tag.enum';

export class AnnotationResponse {
  id: number;
  editionId: number;
  userId: number;
  startOffset: number;
  endOffset: number;
  comment: string;
  tag: AnnotationTag | null;
  color: AnnotationColor;
  createdAt: string;
  updatedAt: string;
}
