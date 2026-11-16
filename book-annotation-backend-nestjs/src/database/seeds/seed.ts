import { readFileSync } from 'fs';
import { join } from 'path';
import { EntityManager, IsNull } from 'typeorm';
import { normalizeText } from '../../common/utils/normalize-text';
import { hashPassword } from '../../common/utils/password';
import { Annotation } from '../../models/annotation';
import { Bookmark } from '../../models/bookmark';
import { Edition } from '../../models/edition';
import { LibraryEntry } from '../../models/library-entry';
import { Note } from '../../models/note';
import { ReadingPreferences } from '../../models/reading-preferences';
import { User } from '../../models/user';
import { Work } from '../../models/work';
import dataSource from '../data-source';
import {
  EditionKey,
  SEED_ANNOTATIONS,
  SEED_BOOKMARKS,
  SEED_EDITIONS,
  SEED_LIBRARY,
  SEED_NOTES,
  SEED_PREFERENCES,
  SEED_USER,
  SeedEdition,
  SeedWork,
} from './seed-data';

const TEXTS_DIRECTORY = join(__dirname, 'texts');

/** A stored edition together with its content, which is not selected by default. */
type SeededEdition = Edition & { content: string };

/**
 * Idempotent seed (`npm run seed`). Catalogue data is matched by natural keys
 * and reused; the seed user's personal data is replaced on every run.
 */
async function seed(): Promise<void> {
  const password = process.env.SEED_USER_PASSWORD;
  if (!password) {
    throw new Error('SEED_USER_PASSWORD is not set (see .env.example)');
  }

  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      const user = await upsertUser(manager, password);
      await upsertPreferences(manager, user.id);
      const editions = await upsertEditions(manager, user.id);
      await replacePersonalData(manager, user.id, editions);
      logSummary(user, editions);
    });
  } finally {
    await dataSource.destroy();
  }
}

async function upsertUser(
  manager: EntityManager,
  password: string,
): Promise<User> {
  const users = manager.getRepository(User);
  const passwordHash = await hashPassword(password);
  const existing = await users.findOneBy({ email: SEED_USER.email });
  if (existing) {
    existing.passwordHash = passwordHash;
    return users.save(existing);
  }
  return users.save(
    users.create({
      username: SEED_USER.username,
      email: SEED_USER.email,
      passwordHash,
      createdAt: new Date(SEED_USER.createdAt),
    }),
  );
}

async function upsertPreferences(
  manager: EntityManager,
  userId: number,
): Promise<void> {
  await manager
    .getRepository(ReadingPreferences)
    .save({ userId, ...SEED_PREFERENCES });
}

async function upsertEditions(
  manager: EntityManager,
  userId: number,
): Promise<Map<EditionKey, SeededEdition>> {
  const editions = new Map<EditionKey, SeededEdition>();
  for (const seedEdition of SEED_EDITIONS) {
    const work = await upsertWork(manager, seedEdition.work);
    const uploadedByUserId = seedEdition.uploadedBySeedUser ? userId : null;
    const edition =
      (await findEditionWithContent(manager, work.id, uploadedByUserId)) ??
      (await createEdition(manager, seedEdition, work.id, uploadedByUserId));
    editions.set(seedEdition.key, edition);
  }
  return editions;
}

async function upsertWork(
  manager: EntityManager,
  seedWork: SeedWork,
): Promise<Work> {
  const works = manager.getRepository(Work);
  const existing = await works.findOneBy({
    title: seedWork.title,
    author: seedWork.author,
  });
  return works.save({ ...existing, ...seedWork });
}

/** Content is immutable, so an existing edition is reused as it is. */
async function findEditionWithContent(
  manager: EntityManager,
  workId: number,
  uploadedByUserId: number | null,
): Promise<SeededEdition | null> {
  const edition = await manager
    .getRepository(Edition)
    .createQueryBuilder('edition')
    .addSelect('edition.content')
    .where({ workId, uploadedByUserId: uploadedByUserId ?? IsNull() })
    .getOne();
  return edition;
}

async function createEdition(
  manager: EntityManager,
  seedEdition: SeedEdition,
  workId: number,
  uploadedByUserId: number | null,
): Promise<SeededEdition> {
  const content = normalizeText(
    readFileSync(join(TEXTS_DIRECTORY, seedEdition.textFile), 'utf8'),
  );
  const edition = await manager.getRepository(Edition).save({
    workId,
    language: seedEdition.language,
    isbn: null,
    pages: seedEdition.pages,
    pageSize: seedEdition.pageSize,
    content,
    contentLength: content.length,
    sourceFormat: seedEdition.sourceFormat,
    coverUrl: null,
    uploadedByUserId,
  });
  return { ...edition, content };
}

async function replacePersonalData(
  manager: EntityManager,
  userId: number,
  editions: Map<EditionKey, SeededEdition>,
): Promise<void> {
  for (const entity of [Annotation, Note, Bookmark, LibraryEntry]) {
    await manager.getRepository(entity).delete({ userId });
  }

  await manager.getRepository(LibraryEntry).save(
    SEED_LIBRARY.map((entry) => {
      const edition = editionFor(editions, entry.edition);
      return {
        userId,
        editionId: edition.id,
        addedAt: new Date(entry.addedAt),
        lastOpenedAt: entry.lastOpenedAt ? new Date(entry.lastOpenedAt) : null,
        lastPosition: pageStart(edition, entry.lastPage),
      };
    }),
  );

  await manager.getRepository(Annotation).save(
    SEED_ANNOTATIONS.map((annotation) => {
      const edition = editionFor(editions, annotation.edition);
      const createdAt = new Date(annotation.createdAt);
      return {
        userId,
        editionId: edition.id,
        ...offsetsOf(edition, annotation.quote),
        color: annotation.color,
        tag: annotation.tag,
        comment: annotation.comment,
        createdAt,
        updatedAt: createdAt,
        deletedAt: annotation.deleted ? createdAt : null,
      };
    }),
  );

  await manager.getRepository(Note).save(
    SEED_NOTES.map((note) => ({
      userId,
      editionId: editionFor(editions, note.edition).id,
      content: note.content,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    })),
  );

  await manager.getRepository(Bookmark).save(
    SEED_BOOKMARKS.map((bookmark) => {
      const edition = editionFor(editions, bookmark.edition);
      return {
        userId,
        editionId: edition.id,
        offset: pageStart(edition, bookmark.page),
        label: bookmark.label,
        createdAt: new Date(bookmark.createdAt),
      };
    }),
  );
}

function editionFor(
  editions: Map<EditionKey, SeededEdition>,
  key: EditionKey,
): SeededEdition {
  const edition = editions.get(key);
  if (!edition) {
    throw new Error(`Seed data refers to unknown edition "${key}"`);
  }
  return edition;
}

function offsetsOf(
  edition: SeededEdition,
  quote: string,
): { startOffset: number; endOffset: number } {
  const startOffset = edition.content.indexOf(quote);
  if (startOffset === -1) {
    throw new Error(
      `Quote not found in edition ${edition.id}: "${quote.slice(0, 60)}"`,
    );
  }
  return { startOffset, endOffset: startOffset + quote.length };
}

function pageStart(edition: SeededEdition, page: number): number {
  const offset = page * edition.pageSize;
  if (offset > edition.contentLength) {
    throw new Error(
      `Page ${page} is beyond the end of edition ${edition.id} (${edition.contentLength} chars)`,
    );
  }
  return offset;
}

function logSummary(
  user: User,
  editions: Map<EditionKey, SeededEdition>,
): void {
  console.log(`Seeded user "${user.username}" (id ${user.id})`);
  for (const [key, edition] of editions) {
    const visibility =
      edition.uploadedByUserId === null ? 'catalogue' : 'private upload';
    console.log(
      `  edition ${edition.id} (${key}, ${visibility}): ${edition.contentLength} chars, page size ${edition.pageSize}`,
    );
  }
  console.log(
    `  ${SEED_LIBRARY.length} library entries, ${SEED_ANNOTATIONS.length} annotations (1 soft-deleted), ${SEED_NOTES.length} notes, ${SEED_BOOKMARKS.length} bookmarks`,
  );
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
