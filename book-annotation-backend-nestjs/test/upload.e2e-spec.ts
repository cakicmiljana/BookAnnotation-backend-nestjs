import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, EntityManager, In, Like } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { Edition } from '../src/models/edition';
import { User } from '../src/models/user';
import { Work } from '../src/models/work';

interface Book {
  id: number;
  workId: number;
  title: string;
  author: string;
  uploadedByMe: boolean;
  contentLength: number;
}

const BOOK_TEXT = 'A line of a small book uploaded by an e2e test.\r\n'.repeat(
  5,
);

// Uses two temporary users. Their uploads are removed together with them
// (editions and library entries cascade); the works are deleted by title.
describe('Upload (e2e)', () => {
  let app: INestApplication<App>;
  const stamp = Date.now();
  const uploaderUsername = `e2e_upload_a_${stamp}`;
  const otherUsername = `e2e_upload_b_${stamp}`;
  const workTitle = `E2E Upload Book ${stamp}`;

  let uploaderToken: string;
  let otherToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    uploaderToken = await register(uploaderUsername);
    otherToken = await register(otherUsername);
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource
      .getRepository(User)
      .delete({ username: In([uploaderUsername, otherUsername]) });
    await dataSource
      .getRepository(Work)
      .delete({ title: Like(`E2E % Book ${stamp}`) });
    await app.close();
  });

  async function register(username: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username,
        email: `${username}@example.com`,
        password: 'temporary123',
      })
      .expect(201);
    return (response.body as { token: string }).token;
  }

  function get(path: string, token: string) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function upload(
    fileName: string,
    contentType: string,
    content: string | Buffer,
    fields: Record<string, string>,
  ) {
    return request(app.getHttpServer())
      .post('/api/editions')
      .set('Authorization', `Bearer ${uploaderToken}`)
      .field(fields)
      .attach('file', Buffer.from(content), {
        filename: fileName,
        contentType,
      });
  }

  it('uploads a .txt as a new work, adds it to the library and the work', async () => {
    const response = await upload('book.txt', 'text/plain', BOOK_TEXT, {
      title: workTitle,
      author: 'E2E Author',
      language: 'English',
    }).expect(201);
    const book = response.body as Book;

    expect(book).toMatchObject({ title: workTitle, uploadedByMe: true });
    // Text was normalized: \r\n became \n and the last line break was trimmed.
    expect(book.contentLength).toBe(
      BOOK_TEXT.replace(/\r\n/g, '\n').trimEnd().length,
    );

    const library = await get('/api/me/library', uploaderToken).expect(200);
    expect((library.body as Book[]).map((item) => item.id)).toContain(book.id);

    const editions = await get(
      `/api/works/${book.workId}/editions`,
      uploaderToken,
    ).expect(200);
    expect((editions.body as Book[]).map((item) => item.id)).toEqual([book.id]);
  });

  it('matches an existing work by title + author, ignoring letter case', async () => {
    const first = await get('/api/editions', uploaderToken).expect(200);
    const original = (first.body as Book[]).find(
      (book) => book.title === workTitle,
    );

    const response = await upload('copy.txt', 'text/plain', BOOK_TEXT, {
      title: workTitle.toUpperCase(),
      author: 'e2e author',
      language: 'German',
    }).expect(201);

    expect((response.body as Book).workId).toBe(original?.workId);
  });

  it('keeps the upload private: another user gets 404 for it', async () => {
    const mine = await get('/api/editions', uploaderToken).expect(200);
    const uploaded = (mine.body as Book[]).find(
      (book) => book.title === workTitle,
    );

    await get(`/api/editions/${uploaded?.id}`, otherToken).expect(404);
  });

  it('rejects a file that is not .pdf or .txt with 415', async () => {
    await upload('book.docx', 'application/octet-stream', 'PK fake', {
      title: workTitle,
      author: 'E2E Author',
      language: 'English',
    }).expect(415);
  });

  it('rejects a file larger than UPLOAD_MAX_BYTES with 413', async () => {
    const tooBig = Buffer.alloc(10 * 1024 * 1024 + 1, 'a');

    await upload('big.txt', 'text/plain', tooBig, {
      title: workTitle,
      author: 'E2E Author',
      language: 'English',
    }).expect(413);
  });

  it('rolls everything back when the library entry cannot be saved', async () => {
    const rollbackTitle = `E2E Rollback Book ${stamp}`;
    const insertSpy = jest
      .spyOn(EntityManager.prototype, 'insert')
      .mockRejectedValueOnce(new Error('Simulated database failure'));

    await upload('book.txt', 'text/plain', BOOK_TEXT, {
      title: rollbackTitle,
      author: 'E2E Author',
      language: 'English',
    }).expect(500);
    insertSpy.mockRestore();

    const dataSource = app.get(DataSource);
    const work = await dataSource
      .getRepository(Work)
      .findOneBy({ title: rollbackTitle });
    const uploaderEditions = await dataSource
      .getRepository(Edition)
      .countBy({ uploadedByUser: { username: uploaderUsername } });

    expect(work).toBeNull();
    // Only the two editions from the earlier tests exist.
    expect(uploaderEditions).toBe(2);
  });
});
