import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEditionCoverUrl1795717566159 implements MigrationInterface {
  name = 'RemoveEditionCoverUrl1795717566159';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "editions" DROP COLUMN "cover_url"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "editions" ADD "cover_url" character varying`,
    );
  }
}
