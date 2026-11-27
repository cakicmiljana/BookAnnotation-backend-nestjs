import { EditionResponse } from '../editions/edition.response';

export class GetLibraryItemResponse extends EditionResponse {
  addedAt: string;
  lastOpenedAt: string | null;
  lastPosition: number;
}
