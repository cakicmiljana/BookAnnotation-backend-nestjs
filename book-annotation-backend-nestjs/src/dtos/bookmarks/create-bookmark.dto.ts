import { IsInt, Min } from 'class-validator';

export class CreateBookmarkDto {
  /** Start offset of the bookmarked reading location */
  @IsInt()
  @Min(0)
  offset: number;
}
