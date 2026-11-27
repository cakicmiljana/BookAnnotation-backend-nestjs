import { BookmarkResponse } from '../dtos/bookmarks/bookmark.response';
import { Bookmark } from '../models/bookmark';

export const toBookmarkResponse = (bookmark: Bookmark): BookmarkResponse => ({
  id: bookmark.id,
  editionId: bookmark.editionId,
  offset: bookmark.offset,
  createdAt: bookmark.createdAt.toISOString(),
});
