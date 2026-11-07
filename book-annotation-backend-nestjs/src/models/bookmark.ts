import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Edition } from './edition';
import { User } from './user';

@Entity('bookmarks')
@Unique('UQ_bookmarks_user_edition_offset', ['userId', 'editionId', 'offset'])
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'int' })
  editionId: number;

  @ManyToOne(() => Edition, { nullable: false })
  @JoinColumn()
  edition: Edition;

  @Column({ type: 'int' })
  offset: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
