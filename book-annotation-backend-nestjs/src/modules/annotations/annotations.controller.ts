import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { AnnotationQueryDto } from '../../dtos/annotations/annotation-query.dto';
import { AnnotationResponse } from '../../dtos/annotations/annotation.response';
import { CreateAnnotationDto } from '../../dtos/annotations/create-annotation.dto';
import { NotebookAnnotationQueryDto } from '../../dtos/annotations/notebook-annotation-query.dto';
import { NotebookAnnotationResponse } from '../../dtos/annotations/notebook-annotation.response';
import { UpdateAnnotationDto } from '../../dtos/annotations/update-annotation.dto';
import { AnnotationsService } from './annotations.service';

@ApiTags('annotations')
@ApiBearerAuth()
@Controller()
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get('editions/:editionId/annotations')
  getAllForEdition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Query() query: AnnotationQueryDto,
  ): Promise<AnnotationResponse[]> {
    // return this.annotationsService.findForEdition(user.id, editionId, query);
    return notImplemented(user, editionId, query);
  }

  @Post('editions/:editionId/annotations')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Body() dto: CreateAnnotationDto,
  ): Promise<AnnotationResponse> {
    // return this.annotationsService.create(user.id, editionId, dto);
    return notImplemented(user, editionId, dto);
  }

  @Patch('annotations/:id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnotationDto,
  ): Promise<AnnotationResponse> {
    // return this.annotationsService.update(user.id, id, dto);
    return notImplemented(user, id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('annotations/:id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    // return this.annotationsService.remove(user.id, id);
    return notImplemented(user, id);
  }

  /** Notebook: annotations across all editions, ordered by edition title, then startOffset. */
  @Get('me/annotations')
  findForNotebook(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotebookAnnotationQueryDto,
  ): Promise<NotebookAnnotationResponse[]> {
    // return this.annotationsService.findForNotebook(user.id, query);
    return notImplemented(user, query);
  }
}
