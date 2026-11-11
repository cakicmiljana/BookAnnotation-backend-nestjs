import { IsString, MaxLength } from 'class-validator';

export class UpsertNoteDto {
  /** May be empty */
  @IsString()
  @MaxLength(100_000)
  content: string;
}
