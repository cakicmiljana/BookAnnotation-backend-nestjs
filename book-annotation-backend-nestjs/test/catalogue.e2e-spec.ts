import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { User } from '../src/models/user';

interface Book {
  id: number;
  workId: number;
  title: string;
  publicationYear: number | null;
  uploadedByMe: boolean;
  contentLength: number;
}

// Needs the seed data (npm run seed): three catalogue editions plus miljana's
// private copy of Dorian Gray. A second, temporary user checks that the private
// copy stays invisible to everyone else; that user is deleted at the end.
describe('Catalogue (e2e)', () => {
  let app: INestApplication<App>;
  const otherUsername = `e2e_catalogue_${Date.now()}`;

  let miljanaToken: string;
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

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'miljana',
        password: process.env.SEED_USER_PASSWORD ?? 'reader123',
      })
      .expect(200);
    miljanaToken = (login.body as { token: string }).token;

    const register = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: otherUsername,
        email: `${otherUsername}@example.com`,
        password: 'temporary123',
      })
      .expect(201);
    otherToken = (register.body as { token: string }).token;

    // Find the seeded editions through the API instead of hard-coding ids.
    const books = await getBooks('/api/editions', miljanaToken);
    gatsby = findOrFail(books, (book) => book.title === 'The Great Gatsby');
    privateDorian = findOrFail(books, (book) => book.uploadedByMe);
  });

  afterAll(async () => {
    await app
      .get(DataSource)
      .getRepository(User)
      .delete({ username: otherUsername });
    await app.close();
  });

  function get(path: string, token: string) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  }

  async function getBooks(path: string, token: string): Promise<Book[]> {
    const response = await get(path, token).expect(200);
    return response.body as Book[];
  }

  function findOrFail(books: Book[], matches: (book: Book) => boolean): Book {
    const book = books.find(matches);
    if (!book) {
      throw new Error('Seed data is missing; run npm run seed');
    }
    return book;
  }

  describe('GET /api/editions', () => {
    it('shows miljana the three catalogue editions plus her private upload', async () => {
      const books = await getBooks('/api/editions', miljanaToken);

      expect(books).toHaveLength(4);
      expect(books.filter((book) => book.uploadedByMe)).toHaveLength(1);
    });

    it("shows another user only the catalogue, never miljana's upload", async () => {
      const books = await getBooks('/api/editions', otherToken);

      expect(books).toHaveLength(3);
      expect(books.map((book) => book.id)).not.toContain(privateDorian.id);
      expect(books.some((book) => book.uploadedByMe)).toBe(false);
    });

    it('searches title and author case-insensitively', async () => {
      const miljanaBooks = await getBooks(
        '/api/editions?q=WILDE',
        miljanaToken,
      );
      const otherBooks = await getBooks('/api/editions?q=WILDE', otherToken);

      expect(miljanaBooks).toHaveLength(2);
      expect(otherBooks).toHaveLength(1);
    });

    it('sorts by publication year', async () => {
      const books = await getBooks('/api/editions?sort=year', miljanaToken);
      const years = books.map((book) => book.publicationYear ?? 0);

      expect(years).toEqual([...years].sort((a, b) => a - b));
    });
  });

  describe('GET /api/editions/:id and /content', () => {
    it('returns a catalogue edition without its text', async () => {
      const response = await get(
        `/api/editions/${gatsby.id}`,
        otherToken,
      ).expect(200);

      expect((response.body as Book).title).toBe('The Great Gatsby');
      expect(response.body).not.toHaveProperty('content');
    });

    it('returns the full text only from the content endpoint', async () => {
      const response = await get(
        `/api/editions/${gatsby.id}/content`,
        otherToken,
      ).expect(200);

      const body = response.body as { content: string; contentLength: number };
      expect(body.content).toHaveLength(gatsby.contentLength);
      expect(body.contentLength).toBe(gatsby.contentLength);
    });

    it('lets miljana open her own upload', async () => {
      await get(`/api/editions/${privateDorian.id}`, miljanaToken).expect(200);
      await get(
        `/api/editions/${privateDorian.id}/content`,
        miljanaToken,
      ).expect(200);
    });

    it("answers another user with 404 for miljana's upload and its text", async () => {
      const response = await get(
        `/api/editions/${privateDorian.id}`,
        otherToken,
      ).expect(404);

      expect((response.body as { message: string }).message).toBe(
        `Edition ${privateDorian.id} was not found`,
      );
      await get(`/api/editions/${privateDorian.id}/content`, otherToken).expect(
        404,
      );
    });
  });

  describe('GET /api/works/:workId and /editions', () => {
    it('counts and lists only the editions each user can see', async () => {
      const workPath = `/api/works/${privateDorian.workId}`;

      const miljanaWork = await get(workPath, miljanaToken).expect(200);
      const otherWork = await get(workPath, otherToken).expect(200);
      expect((miljanaWork.body as { editionCount: number }).editionCount).toBe(
        2,
      );
      expect((otherWork.body as { editionCount: number }).editionCount).toBe(1);

      const miljanaEditions = await getBooks(
        `${workPath}/editions`,
        miljanaToken,
      );
      const otherEditions = await getBooks(`${workPath}/editions`, otherToken);
      expect(miljanaEditions.map((book) => book.id)).toContain(
        privateDorian.id,
      );
      expect(otherEditions.map((book) => book.id)).not.toContain(
        privateDorian.id,
      );
    });

    it('returns 404 for a work that does not exist', async () => {
      await get('/api/works/999999', miljanaToken).expect(404);
      await get('/api/works/999999/editions', miljanaToken).expect(404);
    });
  });
});
