import { EditionResponse } from '../editions/edition.response';

/** An `EditionResponse` (still a valid frontend `Book`) plus reading state. */
export class LibraryItemResponse extends EditionResponse {
  addedAt: string;
  lastOpenedAt: string | null;
  lastPosition: number;
}
