import { GetLibraryItemResponse } from '../dtos/library/get-library-item.response';
import { LibraryEntry } from '../models/library-entry';
import { toEditionResponse } from './edition.mapper';

export const toLibraryItemResponse = (
  entry: LibraryEntry,
  currentUserId: number,
): GetLibraryItemResponse => ({
  ...toEditionResponse(entry.edition, currentUserId),
  addedAt: entry.addedAt.toISOString(),
  lastOpenedAt: entry.lastOpenedAt ? entry.lastOpenedAt.toISOString() : null,
  lastPosition: entry.lastPosition,
});
