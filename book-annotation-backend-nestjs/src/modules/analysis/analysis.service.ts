import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { AnalyzePassageDto } from '../../dtos/analysis/analyze-passage.dto';
import { FollowUpDto } from '../../dtos/analysis/follow-up.dto';
import { FollowUpResponse } from '../../dtos/analysis/follow-up.response';
import { PassageAnalysisResponse } from '../../dtos/analysis/passage-analysis.response';

@Injectable()
export class AnalysisService {
  /** Reads the passage from the stored content using the offsets. */
  analyze(
    userId: number,
    dto: AnalyzePassageDto,
  ): Promise<PassageAnalysisResponse> {
    return notImplemented(userId, dto);
  }

  followUp(userId: number, dto: FollowUpDto): Promise<FollowUpResponse> {
    return notImplemented(userId, dto);
  }
}
