import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { EditionContentResponse } from '../../dtos/editions/edition-content.response';
import { EditionQueryDto } from '../../dtos/editions/edition-query.dto';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { EditionsService } from './editions.service';

// Uploading (POST /api/editions) is in UploadModule.
@ApiTags('editions')
@ApiBearerAuth()
@Controller('editions')
export class EditionsController {
  constructor(private readonly editionsService: EditionsService) {}

  @Get()
  getAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: EditionQueryDto,
  ): Promise<EditionResponse[]> {
    return this.editionsService.findAllAccessible(user.id, query);
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EditionResponse> {
    return this.editionsService.findOne(user.id, id);
  }

  @Get(':id/content')
  getContent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EditionContentResponse> {
    return this.editionsService.getContent(user.id, id);
  }
}
