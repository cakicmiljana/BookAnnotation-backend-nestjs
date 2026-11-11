import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { WorkResponse } from '../../dtos/works/work.response';
import { WorksService } from './works.service';

@ApiTags('works')
@ApiBearerAuth()
@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get(':workId')
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workId', ParseIntPipe) workId: number,
  ): Promise<WorkResponse> {
    // return this.worksService.findOne(workId, user.id);
    return notImplemented(user, workId);
  }

  @Get(':workId/editions')
  findEditions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workId', ParseIntPipe) workId: number,
  ): Promise<EditionResponse[]> {
    // return this.editionsService.findAccessibleByWork(workId, user.id);
    return notImplemented(user, workId);
  }
}
