import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { LibraryItemResponse } from '../../dtos/library/library-item.response';

@Injectable()
export class LibraryService {
  /** Sorted by lastOpenedAt DESC NULLS LAST, then addedAt DESC. */
  findAll(userId: number): Promise<LibraryItemResponse[]> {
    return notImplemented(userId);
  }

  /** Idempotent. */
  add(userId: number, editionId: number): Promise<LibraryItemResponse> {
    return notImplemented(userId, editionId);
  }

  /** Removes the entry only; annotations and notes stay. */
  remove(userId: number, editionId: number): Promise<void> {
    return notImplemented(userId, editionId);
  }

  /** Upsert: sets lastPosition and lastOpenedAt = now(). */
  updatePosition(
    userId: number,
    editionId: number,
    offset: number,
  ): Promise<LibraryItemResponse> {
    return notImplemented(userId, editionId, offset);
  }
}
