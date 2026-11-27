import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { GetEditionQueryDto } from '../../dtos/editions/get-edition-query.dto';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { GetWorkResponse } from '../../dtos/works/get-work.response';
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

  @Get()
  getAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetEditionQueryDto,
  ): Promise<GetWorkResponse[]> {
    return this.worksService.findAllAccessible(user.id, query);
  }

  @Get(':workId')
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workId', ParseIntPipe) workId: number,
  ): Promise<GetWorkResponse> {
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
