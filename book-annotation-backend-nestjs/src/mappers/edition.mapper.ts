import { EditionSummaryResponse } from '../dtos/editions/edition-summary.response';
import { EditionResponse } from '../dtos/editions/edition.response';
import { Edition } from '../models/edition';
import { toWorkSummaryResponse } from './work.mapper';

export const toEditionResponse = (
  edition: Edition,
  currentUserId: number,
): EditionResponse => ({
  id: edition.id,
  workId: edition.workId,
  work: toWorkSummaryResponse(edition.work),
  language: edition.language,
  isbn: edition.isbn,
  pages: edition.pages,
  pageSize: edition.pageSize,
  contentLength: edition.contentLength,
  uploadedByMe: edition.uploadedByUserId === currentUserId,
  createdAt: edition.createdAt.toISOString(),
});

// The short edition reference inside Notebook items (annotations and notes).
export const toEditionSummaryResponse = (
  edition: Edition,
): EditionSummaryResponse => ({
  id: edition.id,
  title: edition.work.title,
  author: edition.work.author,
  language: edition.language,
});
