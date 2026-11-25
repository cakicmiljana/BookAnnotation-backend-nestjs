import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { emptyStringToNull } from '../../common/transforms/string.transforms';
import { AnnotationColor } from '../../models/enums/annotation-color.enum';
import { AnnotationTag } from '../../models/enums/annotation-tag.enum';

export class CreateAnnotationDto {
  @IsInt()
  @Min(0)
  startOffset: number;

  @IsInt()
  @Min(1)
  endOffset: number;

  @IsEnum(AnnotationColor)
  color: AnnotationColor;

  @IsOptional()
  @Transform(emptyStringToNull)
  @IsEnum(AnnotationTag)
  tag?: AnnotationTag | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;
}
