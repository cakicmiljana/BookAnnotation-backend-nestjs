# Book Annotation App — backend

REST API for a private reading room. A user reads books from a shared catalogue or
uploads their own (PDF or plain text), keeps a personal library, highlights passages
with annotations, writes one note per book, sets bookmarks and keeps reading
preferences. Everything a user creates is private to them.

Built with NestJS 11 (Express), TypeORM and PostgreSQL 16, with JWT authentication.

## Requirements

- Node.js 24 and npm
- Docker Desktop (for PostgreSQL)

## Setup

### 1. Start the database

The PostgreSQL container is defined in `../../docker-compose.yml` (container
`postgres-dev`, user `rwaapp`, password `rwaapp`, database `test`, port 5432):

```bash
docker compose -f ../../docker-compose.yml up -d postgres
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Then set `JWT_SECRET` in `.env` to a long random value (at least 32 characters).
`.env` is git-ignored; never commit it.

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `CORS_ORIGIN` | — | The frontend's origin, e.g. `http://localhost:4200` |
| `JWT_SECRET` | — | Signs login tokens; at least 32 characters |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime (`3600`, `30m`, `12h`, `1d`, ...) |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | — | PostgreSQL connection |
| `UPLOAD_MAX_BYTES` | `10485760` | Largest accepted upload (10 MB) |
| `SEED_USER_PASSWORD` | — | Password of the seeded user; only used by `npm run seed` |

The app checks these values at startup and refuses to start if one is missing or invalid.

### 3. Install, migrate, seed

```bash
npm install
npm run migration:run
npm run seed
```

The seed creates three catalogue books (public-domain excerpts from Project Gutenberg,
see `src/database/seeds/texts/README.md`) and one user, **`miljana`**, whose password
is `SEED_USER_PASSWORD`. The user gets a private uploaded copy of one book, library
entries, annotations, notes, bookmarks and preferences. Running the seed again resets
that user's data to the same state.

### 4. Run

```bash
npm run start:dev    # development, restarts on changes
npm run build && npm run start:prod
```

The API is served under `http://localhost:3000/api`.

**Swagger UI:** <http://localhost:3000/api/docs>. Log in with `POST /api/auth/login`,
then paste the `token` into **Authorize**.

## Tests

```bash
npm test             # unit tests
npm run test:e2e     # end-to-end tests
```

The end-to-end tests run against the real database, so it must be running, migrated
and seeded. They create temporary users and delete them (and everything they created)
at the end.

Tests cover the business rules: authentication, visibility of uploaded editions,
annotation offsets, the one-note-per-edition rule, the Notebook endpoints and the upload
rules (wrong type, too large, no readable text, work matching, transaction rollback).

## Migrations

```bash
npm run migration:generate -- src/database/migrations/<Name>   # from entity changes
npm run migration:run
npm run migration:revert
npm run migration:show
```

The schema is changed only through migrations (`synchronize` is off). Tables and
columns use `snake_case`; TypeScript uses camelCase.

## Project structure

```
src/
  common/      decorators, guards, shared types and small helpers
  config/      environment validation, database and JWT config
  database/    data source (CLI), naming strategy, migrations, seed
  dtos/        request and response classes (the API contract)
  mappers/     entity → response DTO
  models/      TypeORM entities and enums
  modules/     one folder per feature: controller, service, module
    auth  users  preferences  works  editions  upload
    library  annotations  notes  bookmarks  health
```

## API overview

All routes start with `/api` and need `Authorization: Bearer <token>`, except
`POST /auth/register`, `POST /auth/login`, `GET /health` and `GET /`.

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Profile | `GET/PATCH /me`, `PUT /me/password`, `GET/PUT /me/preferences` |
| Catalogue | `GET /editions`, `GET /editions/:id`, `GET /editions/:id/content`, `POST /editions` (upload), `GET /works/:workId`, `GET /works/:workId/editions` |
| Library | `GET /me/library`, `PUT/DELETE /me/library/:editionId`, `PUT /me/library/:editionId/position` |
| Annotations | `GET/POST /editions/:editionId/annotations`, `PATCH/DELETE /annotations/:id`, `GET /me/annotations` |
| Notes | `GET/PUT/DELETE /editions/:editionId/note`, `GET /me/notes` |
| Bookmarks | `GET/POST /editions/:editionId/bookmarks`, `DELETE /bookmarks/:id` |
| Health | `GET /health` |

See Swagger for request and response shapes.

## Decisions

Places where this backend differs from the implementation spec, or where the spec left
a choice open:

- **Search and AI analysis are not part of this version.** Exact search, semantic
  search and the analysis endpoints (`GET /editions/:id/search`, `POST /analysis`,
  `POST /analysis/follow-up`) are left for a later version.
- **No rate limiting.** Login, register and upload are not throttled.
- **No custom error format.** Errors use NestJS's default body,
  `{ statusCode, message, error }`. For validation errors `message` is a list of
  problems instead of one string.
- **Feature folders.** Code is grouped by feature (`src/modules/<feature>/`), not by
  layer (`controllers/`, `services/`). DTOs, mappers and models stay in shared folders.
- **Separate `UploadModule`.** `POST /editions` lives in its own module because uploading
  needs both `WorksService` and `EditionsService`, and `WorksModule` already depends on
  `EditionsModule`. This avoids a circular dependency.
- **Text extractors are injected as classes.** `EditionUploadService` gets
  `PlainTextExtractor` and `PdfTextExtractor` directly instead of through a
  `TEXT_EXTRACTOR` token. Both implement the `TextExtractor` interface, and tests can
  still replace them.
- **`POST /editions/:editionId/bookmarks` always returns `201`.** A bookmark at an
  offset that already has one returns the existing bookmark instead of a duplicate.
- **`GET /api` stays** as a public "Hello World" route next to `GET /api/health`.
- **Users keep a `deletedAt` column** (soft delete), although account deletion is not
  offered yet.
- **Seed data is defined in code** (`src/database/seeds/seed-data.ts`) with real book
  texts, instead of being read from the frontend's `mock-data.json`.
- **Messages are written inline** in services and guards instead of as named constants.
- **Pinned package versions.** `@nestjs/config` 4.x and `@nestjs/typeorm` 11.x are used
  because the 12.x versions are ESM-only and do not load in Jest. `pdf-parse` is pinned
  to 2.4.5.
- **Uploads:** a file must have the right extension, MIME type and (for PDF) the
  `%PDF-` first bytes, otherwise `415`. Text shorter than 100 characters after
  normalization is rejected with `400 "The file contains no readable text"`. A work is
  matched by title + author ignoring letter case; this is not protected by a unique
  index, so two simultaneous uploads of the same new book could create two works.

## Frontend changes this backend assumes

These are not implemented here; the frontend must make them:

- `environment.api` is `http://localhost:300` (a typo). It must become
  `http://localhost:3000/api`.
- Add an HTTP interceptor that sends `Authorization: Bearer <token>`, and persist the
  token (for example in `localStorage`) so a page refresh does not log the user out.
- The `Book` model loses `content` and `deletedAt` and gains `workId`, `isbn`,
  `contentLength`, `coverUrl` and `uploadedByMe`. The reader loads text from
  `/editions/:id/content`.
- `bookId` → `editionId` in the `Annotation` and `Note` models. `Annotation` gains
  `updatedAt` and loses `deletedAt`.
- The `User` model drops `passwordHash` and `deletedAt` and becomes
  `{ id, username, email, createdAt }`.
- Read error messages from `HttpErrorResponse.error.message`.
- The note effects currently listen to their own `*Success` actions (an infinite loop).
  They must listen to `createNote` / `updateNote` / `deleteNote`; create and update can
  merge into a single upsert action. `deleteAnnotation` has no effect yet.
- Requests never include `userId`; the server takes the user from the token.
- The reader's search and AI analysis panels have no backend in this version.
