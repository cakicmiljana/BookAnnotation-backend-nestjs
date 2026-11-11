import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { AnalyzePassageDto } from '../../dtos/analysis/analyze-passage.dto';
import { FollowUpDto } from '../../dtos/analysis/follow-up.dto';
import { FollowUpResponse } from '../../dtos/analysis/follow-up.response';
import { PassageAnalysisResponse } from '../../dtos/analysis/passage-analysis.response';
import { AnalysisService } from './analysis.service';

// TODO: @Throttle (about 10 requests per minute per user)
@ApiTags('analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  analyze(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AnalyzePassageDto,
  ): Promise<PassageAnalysisResponse> {
    // return this.analysisService.analyze(user.id, dto);
    return notImplemented(user, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('follow-up')
  followUp(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: FollowUpDto,
  ): Promise<FollowUpResponse> {
    // return this.analysisService.followUp(user.id, dto);
    return notImplemented(user, dto);
  }
}
