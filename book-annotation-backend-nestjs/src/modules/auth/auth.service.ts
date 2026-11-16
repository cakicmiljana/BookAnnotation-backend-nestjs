import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { JwtPayload } from '../../common/types/jwt-payload';
import { verifyPassword } from '../../common/utils/password';
import { LoginResponse } from '../../dtos/auth/login.response';
import { RegisterDto } from '../../dtos/auth/register.dto';
import { UsersService } from '../users/users.service';

// A real bcrypt hash of a random value nobody knows. When the username does
// not exist we still compare against it, so a failed login takes the same
// time whether or not the user exists.
export const DUMMY_PASSWORD_HASH =
  '$2b$10$/B05cylnQnNxW4/sl0L2tezdDw8gdHizDyIVcu1U/4lSfGOLX0amO';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Used by LocalStrategy. Returns null when the username/email or the password is wrong.
  async validateCredentials(
    usernameOrEmail: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);

    const hashToCompare = user ? user.passwordHash : DUMMY_PASSWORD_HASH;
    const isPasswordCorrect = await verifyPassword(password, hashToCompare);

    if (!user || !isPasswordCorrect) {
      return null;
    }
    return { id: user.id, username: user.username };
  }

  async issueToken(user: AuthenticatedUser): Promise<LoginResponse> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    const profile = await this.usersService.getProfile(user.id);

    return { user: profile, token };
  }

  async register(dto: RegisterDto): Promise<LoginResponse> {
    const user = await this.usersService.create(
      dto.username,
      dto.email,
      dto.password,
    );
    return this.issueToken({ id: user.id, username: user.username });
  }
}
