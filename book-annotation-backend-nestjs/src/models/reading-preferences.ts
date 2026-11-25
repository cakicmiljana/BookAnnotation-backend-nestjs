import { Column, Entity, PrimaryColumn,
  JoinColumn, OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../database/transformers/numeric.transformer';
import { FontFamily } from './enums/font-family.enum';
import { ReadingWidth } from './enums/reading-width.enum';
import { Theme } from './enums/theme.enum';
import { User } from './user';

@Entity('reading_preferences')
export class ReadingPreferences {
  @PrimaryColumn({ type: 'int' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum', enum: FontFamily, enumName: 'font_family',
    default: FontFamily.Serif,
  })
  fontFamily: FontFamily;

  @Column({ type: 'int', default: 21 })
  fontSize: number;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    // A raw SQL default: a plain 1.85 makes every migration:generate report a false change.
    default: () => '1.85',
    transformer: numericTransformer,
  })
  lineHeight: number;

  @Column({
    type: 'enum', enum: ReadingWidth, enumName: 'reading_width',
    default: ReadingWidth.Comfortable,
  })
  readingWidth: ReadingWidth;

  @Column({
    type: 'enum', enum: Theme, enumName: 'reading_theme',
    default: Theme.Paper,
  })
  theme: Theme;

  @Column({ type: 'boolean', default: true })
  showHighlights: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
