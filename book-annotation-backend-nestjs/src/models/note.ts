import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Edition } from './edition';
import { User } from './user';

@Entity('notes')
@Unique('UQ_notes_user_edition', ['userId', 'editionId'])
export class Note {
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

  @Column({ type: 'text', default: '' })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
