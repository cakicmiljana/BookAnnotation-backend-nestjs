import { IsString, MaxLength } from 'class-validator';

export class UpsertNoteDto {
  @IsString()
  @MaxLength(100_000)
  content: string;
}
