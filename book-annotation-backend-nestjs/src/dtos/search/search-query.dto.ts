import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { SearchMode } from './search-mode.enum';
import { SearchScope } from './search-scope.enum';

export class SearchQueryDto {
  @IsString()
  @Length(1, 200)
  q: string;

  @IsOptional()
  @IsEnum(SearchMode)
  mode: SearchMode = SearchMode.Exact;

  /** `opening` limits the search to the first passage */
  @IsOptional()
  @IsEnum(SearchScope)
  scope: SearchScope = SearchScope.All;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
