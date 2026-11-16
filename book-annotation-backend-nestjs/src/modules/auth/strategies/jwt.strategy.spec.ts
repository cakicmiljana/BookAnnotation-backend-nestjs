import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../../config/env.validation';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = { get: () => 'a-test-secret-that-is-at-least-32-chars' };
  const usersService = { findById: jest.fn() };
  const strategy = new JwtStrategy(
    config as unknown as ConfigService<EnvironmentVariables, true>,
    usersService as unknown as UsersService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the authenticated user when the user still exists', async () => {
    usersService.findById.mockResolvedValue({ id: 1, username: 'miljana' });

    await expect(
      strategy.validate({ sub: 1, username: 'miljana' }),
    ).resolves.toEqual({ id: 1, username: 'miljana' });
    expect(usersService.findById).toHaveBeenCalledWith(1);
  });

  it('throws 401 when the user was deleted, so old tokens stop working', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 1, username: 'miljana' }),
    ).rejects.toThrow(new UnauthorizedException('Authentication required'));
  });
});
