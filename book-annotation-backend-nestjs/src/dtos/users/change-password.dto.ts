import { IsOptional, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  /** 8–72 characters (bcrypt ignores input beyond 72 bytes) */
  @IsString()
  @Length(8, 72)
  newPassword: string;

  /** Optional for now because the UI does not ask for it; will become required. */
  @IsOptional()
  @IsString()
  currentPassword?: string;
}
