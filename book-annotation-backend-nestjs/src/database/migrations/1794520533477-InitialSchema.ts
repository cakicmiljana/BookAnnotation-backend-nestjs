import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1794520533477 implements MigrationInterface {
  name = 'InitialSchema1794520533477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(30) NOT NULL, "email" character varying(254) NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_email" ON "users"  ("email") `,
    );
    // Case-insensitive unique username; declared on User with synchronize: false, so it is written by hand.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_username_lower" ON "users" (lower("username"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "works" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(300) NOT NULL, "author" character varying(200) NOT NULL, "description" text, "country" character varying(100), "original_language" character varying(60), "publication_year" integer, CONSTRAINT "PK_a9ffbf516ba6e52604b29e5cce0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."source_format" AS ENUM('txt', 'pdf')`,
    );
    await queryRunner.query(
      `CREATE TABLE "editions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "work_id" integer NOT NULL, "language" character varying(60) NOT NULL, "isbn" character varying(17), "pages" integer, "page_size" integer NOT NULL DEFAULT '3000', "content" text NOT NULL, "content_length" integer NOT NULL, "source_format" "public"."source_format" NOT NULL, "cover_url" character varying, "uploaded_by_user_id" integer, CONSTRAINT "PK_a04f035dd7a1c3f344481cb6a2e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."annotation_tag" AS ENUM('quote', 'important', 'analysis', 'definition', 'question', 'symbolism', 'motif', 'criticism')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."annotation_color" AS ENUM('lightyellow', 'darkseagreen', 'lightpink', 'lightblue')`,
    );
    await queryRunner.query(
      `CREATE TABLE "annotations" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "edition_id" integer NOT NULL, "start_offset" integer NOT NULL, "end_offset" integer NOT NULL, "comment" text NOT NULL DEFAULT '', "tag" "public"."annotation_tag", "color" "public"."annotation_color" NOT NULL DEFAULT 'lightyellow', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d5b59b40ef7ee54b4309c2e89b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "library_entries" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "edition_id" integer NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_opened_at" TIMESTAMP WITH TIME ZONE, "last_position" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_library_entries_user_edition" UNIQUE ("user_id", "edition_id"), CONSTRAINT "PK_dacc718e1f656c19f0b491147d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "edition_id" integer NOT NULL, "content" text NOT NULL DEFAULT '', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_notes_user_edition" UNIQUE ("user_id", "edition_id"), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."font_family" AS ENUM('serif', 'sans')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reading_width" AS ENUM('narrow', 'comfortable', 'wide')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reading_theme" AS ENUM('paper', 'light', 'night')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reading_preferences" ("user_id" integer NOT NULL, "font_family" "public"."font_family" NOT NULL DEFAULT 'serif', "font_size" integer NOT NULL DEFAULT '21', "line_height" numeric(3,2) NOT NULL DEFAULT '1.85', "reading_width" "public"."reading_width" NOT NULL DEFAULT 'comfortable', "theme" "public"."reading_theme" NOT NULL DEFAULT 'paper', "show_highlights" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c9fa63e620df8de6a9e19b84e6c" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookmarks" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "edition_id" integer NOT NULL, "offset" integer NOT NULL, "label" character varying(120), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_bookmarks_user_edition_offset" UNIQUE ("user_id", "edition_id", "offset"), CONSTRAINT "PK_7f976ef6cecd37a53bd11685f32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "editions" ADD CONSTRAINT "FK_ca4ce37079d8590891731156d9f" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "editions" ADD CONSTRAINT "FK_5adcaed9bbcaa6e1a86997c65ef" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD CONSTRAINT "FK_c831c71c5aa60b0e020b98396ee" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD CONSTRAINT "FK_b1c3f26b5fc489f4b3128a835ec" FOREIGN KEY ("edition_id") REFERENCES "editions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "library_entries" ADD CONSTRAINT "FK_d03ef727850f4b1d48f67c5a1f3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "library_entries" ADD CONSTRAINT "FK_89fc96d843807a3a62744ec0e0a" FOREIGN KEY ("edition_id") REFERENCES "editions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_bd97fc6e049c625e21e36ebe30a" FOREIGN KEY ("edition_id") REFERENCES "editions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reading_preferences" ADD CONSTRAINT "FK_c9fa63e620df8de6a9e19b84e6c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_58a0fbaee65cd8959a870ee678c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_ce99f0d2a71491b0f8a200ab275" FOREIGN KEY ("edition_id") REFERENCES "editions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_ce99f0d2a71491b0f8a200ab275"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_58a0fbaee65cd8959a870ee678c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reading_preferences" DROP CONSTRAINT "FK_c9fa63e620df8de6a9e19b84e6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_bd97fc6e049c625e21e36ebe30a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "library_entries" DROP CONSTRAINT "FK_89fc96d843807a3a62744ec0e0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "library_entries" DROP CONSTRAINT "FK_d03ef727850f4b1d48f67c5a1f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP CONSTRAINT "FK_b1c3f26b5fc489f4b3128a835ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP CONSTRAINT "FK_c831c71c5aa60b0e020b98396ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "editions" DROP CONSTRAINT "FK_5adcaed9bbcaa6e1a86997c65ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "editions" DROP CONSTRAINT "FK_ca4ce37079d8590891731156d9f"`,
    );
    await queryRunner.query(`DROP TABLE "bookmarks"`);
    await queryRunner.query(`DROP TABLE "reading_preferences"`);
    await queryRunner.query(`DROP TYPE "public"."reading_theme"`);
    await queryRunner.query(`DROP TYPE "public"."reading_width"`);
    await queryRunner.query(`DROP TYPE "public"."font_family"`);
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`DROP TABLE "library_entries"`);
    await queryRunner.query(`DROP TABLE "annotations"`);
    await queryRunner.query(`DROP TYPE "public"."annotation_color"`);
    await queryRunner.query(`DROP TYPE "public"."annotation_tag"`);
    await queryRunner.query(`DROP TABLE "editions"`);
    await queryRunner.query(`DROP TYPE "public"."source_format"`);
    await queryRunner.query(`DROP TABLE "works"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_users_username_lower"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
