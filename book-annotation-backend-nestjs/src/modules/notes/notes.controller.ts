import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { NotebookSearchQueryDto } from '../../dtos/common/notebook-search-query.dto';
import { NotebookNoteResponse } from '../../dtos/notes/notebook-note.response';
import { NoteResponse } from '../../dtos/notes/note.response';
import { UpsertNoteDto } from '../../dtos/notes/upsert-note.dto';
import { NotesService } from './notes.service';

@ApiTags('notes')
@ApiBearerAuth()
@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @ApiNoContentResponse({
    description: 'The user has no note for this edition yet',
  })
  @Get('editions/:editionId/note')
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<NoteResponse | undefined> {
    const note = await this.notesService.findOne(user.id, editionId);
    if (!note) {
      response.status(HttpStatus.NO_CONTENT);
      return undefined;
    }
    return note;
  }

  @Put('editions/:editionId/note')
  upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Body() dto: UpsertNoteDto,
  ): Promise<NoteResponse> {
    return this.notesService.upsert(user.id, editionId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('editions/:editionId/note')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
  ): Promise<void> {
    return this.notesService.remove(user.id, editionId);
  }

  /** Notebook: all book notes, ordered by updatedAt DESC. */
  @Get('me/notes')
  findForNotebook(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotebookSearchQueryDto,
  ): Promise<NotebookNoteResponse[]> {
    return this.notesService.findForNotebook(user.id, query);
  }
}
