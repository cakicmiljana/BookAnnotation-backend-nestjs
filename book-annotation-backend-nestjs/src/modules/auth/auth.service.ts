import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { LoginResponse } from '../../dtos/auth/login.response';
import { RegisterDto } from '../../dtos/auth/register.dto';

@Injectable()
export class AuthService {
  /** Used by LocalStrategy. Accepts a username or an email (case-insensitive). */
  validateCredentials(
    usernameOrEmail: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    return notImplemented(usernameOrEmail, password);
  }

  issueToken(user: AuthenticatedUser): Promise<LoginResponse> {
    return notImplemented(user);
  }

  register(dto: RegisterDto): Promise<LoginResponse> {
    return notImplemented(dto);
  }
}
