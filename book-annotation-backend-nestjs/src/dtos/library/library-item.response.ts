import { EditionResponse } from '../editions/edition.response';

/** An `EditionResponse` plus reading state. */
export class LibraryItemResponse extends EditionResponse {
  addedAt: string;
  lastOpenedAt: string | null;
  lastPosition: number;
}
