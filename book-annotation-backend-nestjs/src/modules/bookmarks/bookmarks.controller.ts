import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { BookmarkResponse } from '../../dtos/bookmarks/bookmark.response';
import { CreateBookmarkDto } from '../../dtos/bookmarks/create-bookmark.dto';
import { BookmarksService } from './bookmarks.service';

@ApiTags('bookmarks')
@ApiBearerAuth()
@Controller()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get('editions/:editionId/bookmarks')
  getAllForEdition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
  ): Promise<BookmarkResponse[]> {
    // return this.bookmarksService.findForEdition(user.id, editionId);
    return notImplemented(user, editionId);
  }

  /** Idempotent: 201 for a new bookmark, 200 with the existing one for a duplicate offset. */
  @ApiOkResponse({
    type: BookmarkResponse,
    description: 'Bookmark already existed',
  })
  @Post('editions/:editionId/bookmarks')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Body() dto: CreateBookmarkDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BookmarkResponse> {
    // const { bookmark, created } = await this.bookmarksService.create(user.id, editionId, dto);
    // response.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    // return bookmark;
    return notImplemented(user, editionId, dto, response);
  } // ?????

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('bookmarks/:id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    // return this.bookmarksService.remove(user.id, id);
    return notImplemented(user, id);
  }
}
