import { IsInt, Min } from 'class-validator';

export class UpdateReadingPositionDto {
  /** Character offset; must not exceed the edition's contentLength */
  @IsInt()
  @Min(0)
  offset: number;
}
