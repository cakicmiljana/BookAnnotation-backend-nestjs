import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBookmarkLabel1795809987429 implements MigrationInterface {
  name = 'RemoveBookmarkLabel1795809987429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookmarks" DROP COLUMN "label"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookmarks" ADD "label" character varying(120)`,
    );
  }
}
