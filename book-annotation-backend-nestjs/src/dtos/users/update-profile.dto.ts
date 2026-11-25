import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';
import { trim } from '../../common/transforms/string.transforms';

export class UpdateProfileDto {
  /** 3–30 characters: letters, digits, `_`, `.` or `-` */
  @Transform(trim)
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'username may contain only letters, digits, _, . and -',
  })
  username: string;
}
