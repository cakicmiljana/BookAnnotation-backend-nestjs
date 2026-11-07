import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Edition } from './edition';
import { AnnotationColor } from './enums/annotation-color.enum';
import { AnnotationTag } from './enums/annotation-tag.enum';
import { User } from './user';

@Entity('annotations')
@Index('IDX_annotations_user_edition', ['userId', 'editionId'])
export class Annotation {
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
  startOffset: number;

  @Column({ type: 'int' })
  endOffset: number;

  @Column({ type: 'text', default: '' })
  comment: string;

  @Column({
    type: 'enum',
    enum: AnnotationTag,
    enumName: 'annotation_tag',
    nullable: true,
  })
  tag: AnnotationTag | null;

  @Column({
    type: 'enum',
    enum: AnnotationColor,
    enumName: 'annotation_color',
    default: AnnotationColor.Ochre,
  })
  color: AnnotationColor;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
