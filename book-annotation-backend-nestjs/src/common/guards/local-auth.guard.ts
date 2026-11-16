import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from '../types/authenticated-user';

// Runs LocalStrategy on POST /auth/login.
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // Every failure gets the same 401, including passport-local's own
  // "Missing credentials" error when the username or password field is absent.
  handleRequest<TUser = AuthenticatedUser>(
    error: unknown,
    user: TUser | false,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return user;
  }
}
