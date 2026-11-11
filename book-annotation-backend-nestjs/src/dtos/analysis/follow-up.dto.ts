import { IsString, Length, MaxLength } from 'class-validator';
import { AnalyzePassageDto } from './analyze-passage.dto';

export class FollowUpDto extends AnalyzePassageDto {
  @IsString()
  @MaxLength(4000)
  previousInterpretation: string;

  @IsString()
  @Length(1, 500)
  question: string;
}
