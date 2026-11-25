import { Column, Entity, CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('works')
// Expression index on (lower(title), lower(author)); created in a migration, used by upload matching.
@Index('IDX_works_title_author_lower', { synchronize: false })
export class Work {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'varchar', length: 200 })
  author: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  originalLanguage: string | null;

  @Column({ type: 'int', nullable: true })
  publicationYear: number | null;
}
