import { IsEnum, IsInt, Min } from 'class-validator';
import { AnalysisLens } from '../../models/enums/analysis-lens.enum';

/** The passage is read on the server: content.slice(startOffset, endOffset), 1–4000 chars. */
export class AnalyzePassageDto {
  @IsInt()
  @Min(1)
  editionId: number;

  @IsInt()
  @Min(0)
  startOffset: number;

  @IsInt()
  @Min(1)
  endOffset: number;

  @IsEnum(AnalysisLens)
  lens: AnalysisLens;
}
