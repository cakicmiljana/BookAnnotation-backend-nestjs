import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../common/transforms/string.transforms';

export class NotebookSearchQueryDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  q?: string;
}
