import { UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  const guard = new LocalAuthGuard();
  const uniform401 = new UnauthorizedException('Invalid username or password');

  it('passes the user on when login succeeded', () => {
    const user = { id: 1, username: 'miljana' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('gives the uniform 401 when a field is missing (passport-local reports no user)', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(uniform401);
  });

  it('gives the same uniform 401 for any error', () => {
    expect(() =>
      guard.handleRequest(new Error('Missing credentials'), false),
    ).toThrow(uniform401);
  });
});
