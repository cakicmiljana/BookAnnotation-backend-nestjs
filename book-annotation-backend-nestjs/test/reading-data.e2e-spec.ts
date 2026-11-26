import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, In } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { User } from '../src/models/user';

interface Book {
  id: number;
  work: { title: string };
  uploadedByMe: boolean;
  contentLength: number;
}

interface Annotation {
  id: number;
  startOffset: number;
  endOffset: number;
  comment: string;
  tag: string | null;
}

// Personal reading data: annotations, notes and the Notebook.
// Two temporary users do all the writing ("reader") and the privacy checks
// ("other"); both are deleted at the end, together with all their data.
// miljana (from npm run seed) is only used to look up edition ids.
describe('Reading data (e2e)', () => {
  let app: INestApplication<App>;
  const readerUsername = `e2e_reading_a_${Date.now()}`;
  const otherUsername = `e2e_reading_b_${Date.now()}`;

  let readerToken: string;
  let otherToken: string;
  let gatsby: Book;
  let privateDorian: Book;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    readerToken = await register(readerUsername);
    otherToken = await register(otherUsername);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'miljana',
        password: process.env.SEED_USER_PASSWORD ?? 'reader123',
      })
      .expect(200);
    const miljanaToken = (login.body as { token: string }).token;
    const books = (await call('get', '/api/editions', miljanaToken).expect(200))
      .body as Book[];
    gatsby = findOrFail(
      books,
      (book) => book.work.title === 'The Great Gatsby',
    );
    privateDorian = findOrFail(books, (book) => book.uploadedByMe);
  });

  afterAll(async () => {
    await app
      .get(DataSource)
      .getRepository(User)
      .delete({ username: In([readerUsername, otherUsername]) });
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

  function call(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    token: string,
  ) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${token}`);
  }

  function findOrFail(books: Book[], matches: (book: Book) => boolean): Book {
    const book = books.find(matches);
    if (!book) {
      throw new Error('Seed data is missing; run npm run seed');
    }
    return book;
  }

  describe('annotations', () => {
    const annotationsPath = () => `/api/editions/${gatsby.id}/annotations`;

    it('creates, lists, patches and soft-deletes an annotation', async () => {
      const created = await call('post', annotationsPath(), readerToken)
        .send({ startOffset: 3, endOffset: 30, color: 'lightpink', tag: '' })
        .expect(201);
      const annotation = created.body as Annotation;
      expect(annotation.tag).toBeNull();

      const list = await call('get', annotationsPath(), readerToken);
      expect(list.body).toHaveLength(1);

      // Only endOffset is sent: 2 is below the stored startOffset of 3.
      await call('patch', `/api/annotations/${annotation.id}`, readerToken)
        .send({ endOffset: 2 })
        .expect(400);
      const patched = await call(
        'patch',
        `/api/annotations/${annotation.id}`,
        readerToken,
      )
        .send({ endOffset: 40, comment: 'opening' })
        .expect(200);
      expect(patched.body).toMatchObject({
        startOffset: 3,
        endOffset: 40,
        comment: 'opening',
      });

      await call(
        'delete',
        `/api/annotations/${annotation.id}`,
        readerToken,
      ).expect(204);
      const afterDelete = await call('get', annotationsPath(), readerToken);
      expect(afterDelete.body).toHaveLength(0);
    });

    it('rejects offsets past the end of the text', async () => {
      await call('post', annotationsPath(), readerToken)
        .send({
          startOffset: 0,
          endOffset: gatsby.contentLength + 1,
          color: 'lightblue',
        })
        .expect(400);
    });

    it('shows the annotation in the Notebook with the highlighted text', async () => {
      await call('post', annotationsPath(), readerToken)
        .send({ startOffset: 10, endOffset: 20, color: 'lightblue' })
        .expect(201);
      const content = await call(
        'get',
        `/api/editions/${gatsby.id}/content`,
        readerToken,
      );
      const text = (content.body as { content: string }).content;

      const notebook = await call('get', '/api/me/annotations', readerToken);

      expect(notebook.body).toEqual([
        expect.objectContaining({
          excerpt: text.slice(10, 20),
          edition: expect.objectContaining({
            id: gatsby.id,
            title: 'The Great Gatsby',
          }) as object,
        }),
      ]);
    });

    it("answers another user with 404 for the reader's annotation", async () => {
      const list = await call('get', annotationsPath(), readerToken);
      const annotationId = (list.body as Annotation[])[0].id;

      await call('patch', `/api/annotations/${annotationId}`, otherToken)
        .send({ comment: 'not mine' })
        .expect(404);
      await call(
        'delete',
        `/api/annotations/${annotationId}`,
        otherToken,
      ).expect(404);
    });

    it("answers 404 for annotations on miljana's private upload", async () => {
      await call(
        'get',
        `/api/editions/${privateDorian.id}/annotations`,
        otherToken,
      ).expect(404);
      await call(
        'post',
        `/api/editions/${privateDorian.id}/annotations`,
        otherToken,
      )
        .send({ startOffset: 0, endOffset: 5, color: 'lightblue' })
        .expect(404);
    });
  });

  describe('notes', () => {
    const notePath = () => `/api/editions/${gatsby.id}/note`;

    it('answers 204 before the first note, then upserts the same note', async () => {
      await call('get', notePath(), readerToken).expect(204);

      const first = await call('put', notePath(), readerToken)
        .send({ content: 'First thoughts' })
        .expect(200);
      const second = await call('put', notePath(), readerToken)
        .send({ content: 'Second draft' })
        .expect(200);
      expect((second.body as { id: number }).id).toBe(
        (first.body as { id: number }).id,
      );

      const notebook = await call('get', '/api/me/notes', readerToken);
      expect(notebook.body).toEqual([
        expect.objectContaining({ content: 'Second draft' }),
      ]);

      await call('delete', notePath(), readerToken).expect(204);
      await call('get', notePath(), readerToken).expect(204);
    });
  });
});
