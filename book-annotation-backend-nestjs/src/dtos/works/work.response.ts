export class WorkResponse {
  id: number;
  title: string;
  author: string;
  description: string | null;
  country: string | null;
  originalLanguage: string | null;
  publicationYear: number | null;
  /** Number of editions of this work the current user can access */
  editionCount: number;
}
