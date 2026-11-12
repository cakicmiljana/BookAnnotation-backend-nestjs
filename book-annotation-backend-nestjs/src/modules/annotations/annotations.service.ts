import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { AnnotationQueryDto } from '../../dtos/annotations/annotation-query.dto';
import { AnnotationResponse } from '../../dtos/annotations/annotation.response';
import { CreateAnnotationDto } from '../../dtos/annotations/create-annotation.dto';
import { NotebookAnnotationQueryDto } from '../../dtos/annotations/notebook-annotation-query.dto';
import { NotebookAnnotationResponse } from '../../dtos/annotations/notebook-annotation.response';
import { UpdateAnnotationDto } from '../../dtos/annotations/update-annotation.dto';

@Injectable()
export class AnnotationsService {
  /** Ordered by startOffset. */
  findForEdition(
    userId: number,
    editionId: number,
    query: AnnotationQueryDto,
  ): Promise<AnnotationResponse[]> {
    return notImplemented(userId, editionId, query);
  }

  create(
    userId: number,
    editionId: number,
    dto: CreateAnnotationDto,
  ): Promise<AnnotationResponse> {
    return notImplemented(userId, editionId, dto);
  }

  /** Validates the merged offsets when only one of them is patched. */
  update(
    userId: number,
    annotationId: number,
    dto: UpdateAnnotationDto,
  ): Promise<AnnotationResponse> {
    return notImplemented(userId, annotationId, dto);
  }

  /** Soft delete. */
  remove(userId: number, annotationId: number): Promise<void> {
    return notImplemented(userId, annotationId);
  }

  /** Ordered by edition title, then startOffset. */
  findForNotebook(
    userId: number,
    query: NotebookAnnotationQueryDto,
  ): Promise<NotebookAnnotationResponse[]> {
    return notImplemented(userId, query);
  }
}
