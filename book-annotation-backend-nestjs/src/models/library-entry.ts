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

@Entity('library_entries')
@Unique('UQ_library_entries_user_edition', ['userId', 'editionId'])
export class LibraryEntry {
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

  @CreateDateColumn({ type: 'timestamptz' })
  addedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastOpenedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  lastPosition: number;
}
