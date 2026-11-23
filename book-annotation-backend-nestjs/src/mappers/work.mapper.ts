import { WorkResponse } from '../dtos/works/work.response';
import { Work } from '../models/work';

export const toWorkResponse = (
  work: Work,
  editionCount: number,
): WorkResponse => ({
  id: work.id,
  title: work.title,
  author: work.author,
  description: work.description,
  country: work.country,
  originalLanguage: work.originalLanguage,
  publicationYear: work.publicationYear,
  editionCount,
});
