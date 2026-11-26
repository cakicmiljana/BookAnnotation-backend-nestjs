/** The frontend's `Book`: work fields flattened into the edition. */
export class EditionResponse {
  /** Edition id (the frontend calls it "book id") */
  id: number;
  workId: number;
  title: string;
  author: string;
  description: string | null;
  country: string | null;
  publicationYear: number | null;
  language: string;
  originalLanguage: string | null;
  isbn: string | null;
  pages: number | null;
  pageSize: number;
  contentLength: number;
  uploadedByMe: boolean;
  createdAt: string;
}
