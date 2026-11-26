export class WorkSummaryResponse {
  id: number;
  title: string;
  author: string;
  description: string | null;
  country: string | null;
  originalLanguage: string | null;
  publicationYear: number | null;
}

export class WorkResponse extends WorkSummaryResponse {
  /** Number of editions of this work the current user can access */
  editionCount: number;
}
