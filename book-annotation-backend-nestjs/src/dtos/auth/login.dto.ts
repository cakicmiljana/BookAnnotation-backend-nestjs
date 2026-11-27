import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // username or email, case insensitive
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
