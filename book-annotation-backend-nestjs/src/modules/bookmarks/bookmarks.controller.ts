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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
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
    return this.bookmarksService.findForEdition(user.id, editionId);
  }

  /** Idempotent: always 201; a duplicate offset returns the existing bookmark. */
  @Post('editions/:editionId/bookmarks')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Body() dto: CreateBookmarkDto,
  ): Promise<BookmarkResponse> {
    return this.bookmarksService.create(user.id, editionId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('bookmarks/:id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.bookmarksService.remove(user.id, id);
  }
}
