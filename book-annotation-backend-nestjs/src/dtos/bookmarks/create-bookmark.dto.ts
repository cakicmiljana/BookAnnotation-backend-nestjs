import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { trim } from '../../common/transforms/string.transforms';

export class CreateBookmarkDto {
  /** Start offset of the bookmarked reading location */
  @IsInt()
  @Min(0)
  offset: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  label?: string;
}
