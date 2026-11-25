import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as password from '../../common/utils/password';
import { User } from '../../models/user';
import { UsersService } from '../users/users.service';
import { AuthService, DUMMY_PASSWORD_HASH } from './auth.service';

const usersService = {
  findByUsernameOrEmail: jest.fn(),
  getProfile: jest.fn(),
  create: jest.fn(),
};

const jwtService = {
  signAsync: jest.fn(),
};

const miljanaProfile = {
  id: 1,
  username: 'miljana',
  email: 'miljana@example.com',
  createdAt: '2026-01-01T09:00:00.000Z',
};

describe('AuthService', () => {
  let service: AuthService;
  let miljana: User;

  beforeAll(async () => {
    miljana = {
      id: 1,
      username: 'miljana',
      email: 'miljana@example.com',
      passwordHash: await password.hashPassword('reader123'),
      createdAt: new Date('2026-01-01T09:00:00.000Z'),
      updatedAt: new Date('2026-01-01T09:00:00.000Z'),
      deletedAt: null as unknown as Date,
    };
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateCredentials', () => {
    it('returns the user for the correct password', async () => {
      usersService.findByUsernameOrEmail.mockResolvedValue(miljana);

      const result = await service.validateCredentials('miljana', 'reader123');

      expect(result).toEqual({ id: 1, username: 'miljana' });
    });

    it('returns null for a wrong password', async () => {
      usersService.findByUsernameOrEmail.mockResolvedValue(miljana);

      const result = await service.validateCredentials('miljana', 'wrong');

      expect(result).toBeNull();
    });

    it('returns the same null for an unknown user, after comparing a dummy hash', async () => {
      usersService.findByUsernameOrEmail.mockResolvedValue(null);
      const verifySpy = jest.spyOn(password, 'verifyPassword');

      const result = await service.validateCredentials('nobody', 'reader123');

      expect(result).toBeNull();
      expect(verifySpy).toHaveBeenCalledWith('reader123', DUMMY_PASSWORD_HASH);
    });
  });

  describe('issueToken', () => {
    it('signs { sub, username } and returns the token with the profile', async () => {
      jwtService.signAsync.mockResolvedValue('signed.jwt.token');
      usersService.getProfile.mockResolvedValue(miljanaProfile);

      const result = await service.issueToken({ id: 1, username: 'miljana' });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        username: 'miljana',
      });
      expect(result).toEqual({
        user: miljanaProfile,
        token: 'signed.jwt.token',
      });
    });
  });

  describe('register', () => {
    const dto = {
      username: 'miljana',
      email: 'miljana@example.com',
      password: 'reader123',
    };

    it('creates the user and logs them in', async () => {
      usersService.create.mockResolvedValue(miljana);
      usersService.getProfile.mockResolvedValue(miljanaProfile);
      jwtService.signAsync.mockResolvedValue('signed.jwt.token');

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(
        'miljana',
        'miljana@example.com',
        'reader123',
      );
      expect(result.token).toBe('signed.jwt.token');
    });

    it('passes on the 409 when the username or email is taken, without a token', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('Username is already taken'),
      );

      await expect(service.register(dto)).rejects.toThrow(
        new ConflictException('Username is already taken'),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
