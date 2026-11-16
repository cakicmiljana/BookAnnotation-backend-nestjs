import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  const authService = { validateCredentials: jest.fn() };
  const strategy = new LocalStrategy(authService as unknown as AuthService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user for valid credentials', async () => {
    authService.validateCredentials.mockResolvedValue({
      id: 1,
      username: 'miljana',
    });

    await expect(strategy.validate('miljana', 'reader123')).resolves.toEqual({
      id: 1,
      username: 'miljana',
    });
  });

  it('throws the uniform 401 for invalid credentials', async () => {
    authService.validateCredentials.mockResolvedValue(null);

    await expect(strategy.validate('miljana', 'wrong')).rejects.toThrow(
      new UnauthorizedException('Invalid username or password'),
    );
  });
});
