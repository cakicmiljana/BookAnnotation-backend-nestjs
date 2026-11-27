import { WorkSummaryResponse } from '../works/get-work.response';

export class EditionResponse {
  id: number;
  workId: number;
  work: WorkSummaryResponse;
  language: string;
  isbn: string | null;
  pages: number | null;
  pageSize: number;
  contentLength: number;
  uploadedByMe: boolean;
  createdAt: string;
}
