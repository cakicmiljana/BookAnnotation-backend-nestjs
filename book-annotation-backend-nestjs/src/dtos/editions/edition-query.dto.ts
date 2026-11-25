import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../common/transforms/string.transforms';
import { EditionSort } from './edition-sort.enum';

export class EditionQueryDto {
  /** Case-insensitive match on title or author */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsEnum(EditionSort)
  sort: EditionSort = EditionSort.Title;
}
