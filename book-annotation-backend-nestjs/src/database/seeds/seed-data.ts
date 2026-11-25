import { AnnotationColor } from '../../models/enums/annotation-color.enum';
import { AnnotationTag } from '../../models/enums/annotation-tag.enum';
import { FontFamily } from '../../models/enums/font-family.enum';
import { ReadingWidth } from '../../models/enums/reading-width.enum';
import { SourceFormat } from '../../models/enums/source-format.enum';
import { Theme } from '../../models/enums/theme.enum';

/** Each seeded edition is referred to by one of these keys below. */
export type EditionKey = 'gatsby' | 'crime' | 'dorian' | 'dorianUpload';

export interface SeedWork {
  title: string;
  author: string;
  description: string;
  country: string;
  originalLanguage: string;
  publicationYear: number;
}

export interface SeedEdition {
  key: EditionKey;
  work: SeedWork;
  language: string;
  /** File in ./texts, an excerpt of the Project Gutenberg text */
  textFile: string;
  pages: number | null;
  pageSize: number;
  sourceFormat: SourceFormat;
  /** `true` = a private upload of the seed user; `false` = shared catalogue */
  uploadedBySeedUser: boolean;
}

export interface SeedLibraryEntry {
  edition: EditionKey;
  addedAt: string;
  lastOpenedAt: string | null;
  /** Reading location (page index); stored as page * pageSize */
  lastPage: number;
}

export interface SeedAnnotation {
  edition: EditionKey;
  /** Highlighted text; offsets are computed from its first occurrence */
  quote: string;
  color: AnnotationColor;
  tag: AnnotationTag | null;
  comment: string;
  createdAt: string;
  deleted?: boolean;
}

export interface SeedNote {
  edition: EditionKey;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeedBookmark {
  edition: EditionKey;
  /** Reading location (page index); stored as page * pageSize */
  page: number;
  label: string | null;
  createdAt: string;
}

export const SEED_USER = {
  username: 'miljana',
  email: 'miljana@example.com',
  createdAt: '2026-01-01T09:00:00Z',
};

export const SEED_PREFERENCES = {
  fontFamily: FontFamily.Serif,
  fontSize: 20,
  lineHeight: 1.9,
  readingWidth: ReadingWidth.Comfortable,
  theme: Theme.Paper,
  showHighlights: true,
};

const GATSBY: SeedWork = {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  description: 'Wealth, illusion, and the American Dream.',
  country: 'USA',
  originalLanguage: 'English',
  publicationYear: 1925,
};

const CRIME_AND_PUNISHMENT: SeedWork = {
  title: 'Crime and Punishment',
  author: 'Fyodor Dostoevsky',
  description: 'A psychological exploration of guilt.',
  country: 'Russia',
  originalLanguage: 'Russian',
  publicationYear: 1866,
};

const DORIAN_GRAY: SeedWork = {
  title: 'The Picture of Dorian Gray',
  author: 'Oscar Wilde',
  description: 'A tale of vanity and moral corruption.',
  country: 'UK',
  originalLanguage: 'English',
  publicationYear: 1890,
};

export const SEED_EDITIONS: SeedEdition[] = [
  {
    key: 'gatsby',
    work: GATSBY,
    language: 'English',
    textFile: 'the-great-gatsby.txt',
    pages: 218,
    pageSize: 1200,
    sourceFormat: SourceFormat.Txt,
    uploadedBySeedUser: false,
  },
  {
    key: 'crime',
    work: CRIME_AND_PUNISHMENT,
    language: 'English',
    textFile: 'crime-and-punishment.txt',
    pages: 671,
    pageSize: 1500,
    sourceFormat: SourceFormat.Txt,
    uploadedBySeedUser: false,
  },
  {
    key: 'dorian',
    work: DORIAN_GRAY,
    language: 'English',
    textFile: 'the-picture-of-dorian-gray.txt',
    pages: 254,
    pageSize: 1500,
    sourceFormat: SourceFormat.Txt,
    uploadedBySeedUser: false,
  },
  {
    key: 'dorianUpload',
    work: DORIAN_GRAY,
    language: 'English',
    textFile: 'the-picture-of-dorian-gray.txt',
    pages: null,
    pageSize: 3000,
    sourceFormat: SourceFormat.Txt,
    uploadedBySeedUser: true,
  },
];

export const SEED_LIBRARY: SeedLibraryEntry[] = [
  {
    edition: 'gatsby',
    addedAt: '2026-02-01T10:00:00Z',
    lastOpenedAt: '2026-11-14T20:15:00Z',
    lastPage: 7,
  },
  {
    edition: 'crime',
    addedAt: '2026-02-02T13:30:00Z',
    lastOpenedAt: '2026-11-10T19:00:00Z',
    lastPage: 15,
  },
  {
    edition: 'dorianUpload',
    addedAt: '2026-11-12T17:45:00Z',
    lastOpenedAt: null,
    lastPage: 0,
  },
];

export const SEED_ANNOTATIONS: SeedAnnotation[] = [
  {
    edition: 'gatsby',
    quote: 'Whenever you feel like criticizing anyone',
    color: AnnotationColor.Ochre,
    tag: AnnotationTag.Quote,
    comment: 'The father’s advice frames Nick as a “reserved” judge of others.',
    createdAt: '2026-02-01T12:00:00Z',
  },
  {
    edition: 'gatsby',
    quote: 'Reserving judgements is a matter of infinite hope.',
    color: AnnotationColor.Sage,
    tag: AnnotationTag.Analysis,
    comment: 'Is Nick as non-judgemental as he claims?',
    createdAt: '2026-02-01T12:10:00Z',
  },
  {
    edition: 'gatsby',
    quote: 'a beautiful little fool',
    color: AnnotationColor.Rose,
    tag: AnnotationTag.Criticism,
    comment: 'Daisy’s bitter view of what the world rewards in women.',
    createdAt: '2026-02-01T12:20:00Z',
  },
  {
    edition: 'gatsby',
    quote: 'a single green light, minute and far away',
    color: AnnotationColor.Blue,
    tag: AnnotationTag.Symbolism,
    comment: 'The green light as a metaphor for unreachable desire.',
    createdAt: '2026-02-01T12:30:00Z',
  },
  {
    edition: 'gatsby',
    quote: 'This is a valley of ashes',
    color: AnnotationColor.Ochre,
    tag: AnnotationTag.Motif,
    comment: '',
    createdAt: '2026-02-02T09:00:00Z',
  },
  {
    edition: 'gatsby',
    quote: 'The eyes of Doctor T. J. Eckleburg are blue and gigantic',
    color: AnnotationColor.Blue,
    tag: null,
    comment: 'Who is watching? Come back to this later.',
    createdAt: '2026-02-02T09:15:00Z',
  },
  {
    edition: 'gatsby',
    quote: 'a beautiful little fool',
    color: AnnotationColor.Sage,
    tag: AnnotationTag.Important,
    comment: 'Deleted annotation: must never appear in any response.',
    createdAt: '2026-02-02T09:30:00Z',
    deleted: true,
  },
  {
    edition: 'crime',
    quote: 'On an exceptionally hot evening early in July',
    color: AnnotationColor.Ochre,
    tag: AnnotationTag.Motif,
    comment: 'The heat as the oppressive atmosphere of the whole novel.',
    createdAt: '2026-02-03T18:00:00Z',
  },
  {
    edition: 'crime',
    quote:
      'I want to attempt a thing like that and am frightened by these trifles',
    color: AnnotationColor.Rose,
    tag: AnnotationTag.Analysis,
    comment: 'The murder is framed as philosophical experiment.',
    createdAt: '2026-02-03T18:20:00Z',
  },
  {
    edition: 'crime',
    quote: 'poverty is not a vice',
    color: AnnotationColor.Sage,
    tag: AnnotationTag.Quote,
    comment: 'Marmeladov’s confession in the tavern.',
    createdAt: '2026-02-04T20:00:00Z',
  },
  {
    edition: 'crime',
    quote: 'Man grows used to everything, the scoundrel!',
    color: AnnotationColor.Blue,
    tag: AnnotationTag.Question,
    comment: 'Is this Raskolnikov’s view of himself, or of all mankind?',
    createdAt: '2026-02-04T20:30:00Z',
  },
  {
    edition: 'dorian',
    quote: 'All art is quite useless.',
    color: AnnotationColor.Ochre,
    tag: AnnotationTag.Important,
    comment: 'The provocation the whole preface builds towards.',
    createdAt: '2026-11-12T17:00:00Z',
  },
  {
    edition: 'dorianUpload',
    quote:
      'every portrait that is painted with feeling is a portrait of the artist, not of the sitter',
    color: AnnotationColor.Sage,
    tag: AnnotationTag.Definition,
    comment: 'Basil’s theory of art, and the reason he will not exhibit it.',
    createdAt: '2026-11-12T18:00:00Z',
  },
  {
    edition: 'dorianUpload',
    quote: 'The only way to get rid of a temptation is to yield to it.',
    color: AnnotationColor.Rose,
    tag: AnnotationTag.Quote,
    comment: '',
    createdAt: '2026-11-12T18:05:00Z',
  },
];

export const SEED_NOTES: SeedNote[] = [
  {
    edition: 'gatsby',
    content: [
      'Compare Gatsby’s illusion with modern influencer culture.',
      '',
      'Chapter I sets up Nick as a narrator who promises not to judge, then judges everyone. Track how often he contradicts his own opening.',
    ].join('\n'),
    createdAt: '2026-02-01T13:00:00Z',
    updatedAt: '2026-11-14T20:30:00Z',
  },
  {
    edition: 'crime',
    content: [
      'Part I reads like a pressure chamber: heat, debt, cramped rooms.',
      '',
      'Question for later: does Raskolnikov ever believe his own theory, or is it a justification he builds afterwards?',
    ].join('\n'),
    createdAt: '2026-02-03T19:00:00Z',
    updatedAt: '2026-11-10T19:20:00Z',
  },
];

export const SEED_BOOKMARKS: SeedBookmark[] = [
  {
    edition: 'gatsby',
    page: 0,
    label: 'Opening',
    createdAt: '2026-02-01T11:00:00Z',
  },
  {
    edition: 'gatsby',
    page: 7,
    label: null,
    createdAt: '2026-11-14T20:15:00Z',
  },
  {
    edition: 'crime',
    page: 15,
    label: 'Marmeladov',
    createdAt: '2026-11-10T19:00:00Z',
  },
];
