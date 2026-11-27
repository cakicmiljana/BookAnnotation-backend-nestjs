import { IsEnum, IsOptional } from 'class-validator';
import { AnnotationTag } from '../../models/enums/annotation-tag.enum';

export class GetAnnotationsQueryDto {
  @IsOptional()
  @IsEnum(AnnotationTag)
  tag?: AnnotationTag;
}
