import { IsInt, Min } from 'class-validator';

export class UpdateReadingPositionDto {
  @IsInt()
  @Min(0)
  offset: number;
}
