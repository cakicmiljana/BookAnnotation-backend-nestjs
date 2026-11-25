import {
  Column,Entity, CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('users')
@Index('UQ_users_username_lower', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  username: string;

  @Index('UQ_users_email', { unique: true })
  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
