import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user';
import { JwtPayload } from '../../../common/types/jwt-payload';
import { EnvironmentVariables } from '../../../config/env.validation';
import { UsersService } from '../../users/users.service';

// Used by every protected route: reads "Authorization: Bearer <token>".
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<EnvironmentVariables, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  // Called only after the token's signature and expiry were checked.
  // A deleted (or soft-deleted) user is not found, so their old tokens stop working.
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return { id: user.id, username: user.username };
  }
}
