import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SourceFormat } from './enums/source-format.enum';
import { User } from './user';
import { Work } from './work';

@Entity('editions')
export class Edition {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
  
  @Column({ type: 'int' })
  workId: number;

  @ManyToOne(() => Work, { nullable: false })
  @JoinColumn()
  work: Work;

  @Column({ type: 'varchar', length: 60 })
  language: string;

  @Column({ type: 'varchar', length: 17, nullable: true })
  isbn: string | null;

  @Column({ type: 'int', nullable: true })
  pages: number | null;

  @Column({ type: 'int', default: 3000 })
  pageSize: number;

  @Column({ type: 'text', select: false })
  content: string;

  @Column({ type: 'int' })
  contentLength: number;

  @Column({ type: 'enum', enum: SourceFormat, enumName: 'source_format' })
  sourceFormat: SourceFormat;

  @Column({ type: 'varchar', nullable: true })
  coverUrl: string | null;

  @Column({ type: 'int', nullable: true })
  uploadedByUserId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  uploadedByUser: User | null;
}
