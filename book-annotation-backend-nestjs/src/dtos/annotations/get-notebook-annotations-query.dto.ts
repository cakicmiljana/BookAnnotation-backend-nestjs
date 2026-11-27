import { IntersectionType } from '@nestjs/swagger';
import { NotebookSearchQueryDto } from '../notebook/notebook-search-query.dto';
import { GetAnnotationsQueryDto } from './get-annotations-query.dto';

// searches the comment and the edition title/author
export class GetNotebookAnnotationsQueryDto extends IntersectionType(
  GetAnnotationsQueryDto,
  NotebookSearchQueryDto,
) {}
