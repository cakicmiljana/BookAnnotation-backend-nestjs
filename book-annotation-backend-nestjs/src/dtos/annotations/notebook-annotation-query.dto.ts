import { IntersectionType } from '@nestjs/swagger';
import { NotebookSearchQueryDto } from '../common/notebook-search-query.dto';
import { AnnotationQueryDto } from './annotation-query.dto';

/** `q` searches the comment and the edition title/author. */
export class NotebookAnnotationQueryDto extends IntersectionType(
  AnnotationQueryDto,
  NotebookSearchQueryDto,
) {}
