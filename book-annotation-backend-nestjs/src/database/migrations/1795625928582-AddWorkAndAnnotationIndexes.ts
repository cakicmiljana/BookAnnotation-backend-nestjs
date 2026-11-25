import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkAndAnnotationIndexes1795625928582 implements MigrationInterface {
  name = 'AddWorkAndAnnotationIndexes1795625928582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Upload matches a work by title + author, ignoring letter case.
    await queryRunner.query(
      `CREATE INDEX "IDX_works_title_author_lower" ON "works" (lower("title"), lower("author"))`,
    );
    // The reader loads one user's annotations for one edition.
    await queryRunner.query(
      `CREATE INDEX "IDX_annotations_user_edition" ON "annotations" ("user_id", "edition_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_annotations_user_edition"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_works_title_author_lower"`,
    );
  }
}
