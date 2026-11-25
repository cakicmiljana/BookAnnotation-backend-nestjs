import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { WorkResponse } from '../../dtos/works/work.response';
import { EditionsService } from '../editions/editions.service';
import { WorksService } from './works.service';

@ApiTags('works')
@ApiBearerAuth()
@Controller('works')
export class WorksController {
  constructor(
    private readonly worksService: WorksService,
    private readonly editionsService: EditionsService,
  ) {}

  @Get(':workId')
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workId', ParseIntPipe) workId: number,
  ): Promise<WorkResponse> {
    return this.worksService.findOne(user.id, workId);
  }

  @Get(':workId/editions')
  findEditions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workId', ParseIntPipe) workId: number,
  ): Promise<EditionResponse[]> {
    return this.editionsService.findAccessibleByWork(user.id, workId);
  }
}
