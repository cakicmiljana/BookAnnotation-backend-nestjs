import { WorkResponse, WorkSummaryResponse } from '../dtos/works/work.response';
import { Work } from '../models/work';

export const toWorkSummaryResponse = (work: Work): WorkSummaryResponse => ({
  id: work.id,
  title: work.title,
  author: work.author,
  description: work.description,
  country: work.country,
  originalLanguage: work.originalLanguage,
  publicationYear: work.publicationYear,
});

export const toWorkResponse = (
  work: Work,
  editionCount: number,
): WorkResponse => ({
  ...toWorkSummaryResponse(work),
  editionCount,
});
