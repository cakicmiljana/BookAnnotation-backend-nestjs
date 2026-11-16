import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedUser } from '../types/authenticated-user';

// Runs JwtStrategy. Will be registered globally, so every route needs a
// valid token unless it is marked with @Public().
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  // `info` is the token error from passport-jwt (expired, bad signature, missing, ...).
  handleRequest<TUser = AuthenticatedUser>(
    error: unknown,
    user: TUser | false,
    info: unknown,
  ): TUser {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Your session has expired');
    }
    if (error || !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
