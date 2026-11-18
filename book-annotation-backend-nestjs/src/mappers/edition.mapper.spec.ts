import { Edition } from '../models/edition';
import { SourceFormat } from '../models/enums/source-format.enum';
import { toEditionResponse } from './edition.mapper';

function createDorianUpload(): Edition {
  return {
    id: 4,
    workId: 3,
    work: {
      id: 3,
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      description: 'A tale of vanity and moral corruption.',
      country: 'UK',
      originalLanguage: 'English',
      publicationYear: 1890,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    language: 'English',
    isbn: null,
    pages: null,
    pageSize: 3000,
    content: 'The full text must never be part of the response.',
    contentLength: 59030,
    sourceFormat: SourceFormat.Txt,
    coverUrl: null,
    uploadedByUserId: 1,
    uploadedByUser: null,
    createdAt: new Date('2026-11-12T17:45:00.000Z'),
    updatedAt: new Date('2026-11-12T17:45:00.000Z'),
    deletedAt: null,
  };
}

describe('toEditionResponse', () => {
  it('flattens the work into the edition, like the frontend Book', () => {
    expect(toEditionResponse(createDorianUpload(), 1)).toEqual({
      id: 4,
      workId: 3,
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      description: 'A tale of vanity and moral corruption.',
      country: 'UK',
      publicationYear: 1890,
      language: 'English',
      isbn: null,
      pages: null,
      pageSize: 3000,
      contentLength: 59030,
      coverUrl: null,
      uploadedByMe: true,
      createdAt: '2026-11-12T17:45:00.000Z',
    });
  });

  it('sets uploadedByMe to false for anyone but the uploader', () => {
    expect(toEditionResponse(createDorianUpload(), 2).uploadedByMe).toBe(false);
  });

  it('never includes the text', () => {
    const json = JSON.stringify(toEditionResponse(createDorianUpload(), 1));

    expect(json).not.toContain('full text');
    expect(json).not.toContain('content"');
  });
});
