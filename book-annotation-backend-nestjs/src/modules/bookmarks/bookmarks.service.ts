import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { BookmarkResponse } from '../../dtos/bookmarks/bookmark.response';
import { CreateBookmarkDto } from '../../dtos/bookmarks/create-bookmark.dto';

export interface BookmarkCreationResult {
  bookmark: BookmarkResponse;
  /** `false` when a bookmark at this offset already existed */
  created: boolean;
}

@Injectable()
export class BookmarksService {
  /** Ordered by offset. */
  findForEdition(
    userId: number,
    editionId: number,
  ): Promise<BookmarkResponse[]> {
    return notImplemented(userId, editionId);
  }

  /** Idempotent: returns the existing bookmark for a duplicate offset. */
  create(
    userId: number,
    editionId: number,
    dto: CreateBookmarkDto,
  ): Promise<BookmarkCreationResult> {
    return notImplemented(userId, editionId, dto);
  }

  remove(userId: number, bookmarkId: number): Promise<void> {
    return notImplemented(userId, bookmarkId);
  }
}
