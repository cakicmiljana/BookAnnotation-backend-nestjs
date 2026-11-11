import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';
import { trimAndLowerCase } from '../../common/transforms/string.transforms';
import { UpdateProfileDto } from '../users/update-profile.dto';

export class RegisterDto extends UpdateProfileDto {
  @Transform(trimAndLowerCase)
  @IsEmail()
  @MaxLength(254)
  email: string;

  /** 8–72 characters (bcrypt ignores input beyond 72 bytes) */
  @IsString()
  @Length(8, 72)
  password: string;
}
