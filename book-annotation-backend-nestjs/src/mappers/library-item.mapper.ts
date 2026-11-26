import { LibraryItemResponse } from '../dtos/library/library-item.response';
import { LibraryEntry } from '../models/library-entry';
import { toEditionResponse } from './edition.mapper';

// An edition plus the reading state. The entry must be loaded with its edition and work.
export const toLibraryItemResponse = (
  entry: LibraryEntry,
  currentUserId: number,
): LibraryItemResponse => ({
  ...toEditionResponse(entry.edition, currentUserId),
  addedAt: entry.addedAt.toISOString(),
  lastOpenedAt: entry.lastOpenedAt ? entry.lastOpenedAt.toISOString() : null,
  lastPosition: entry.lastPosition,
});
