import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hashPassword, verifyPassword } from '../../common/utils/password';
import { User } from '../../models/user';
import {
  UsersService,
} from './users.service';

// A fake query builder: every method returns itself, except the two that
// return a result. Tests decide those results with mockResolvedValue.
const queryBuilder = {
  withDeleted: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
  getExists: jest.fn(),
};

const usersRepository = {
  findOneBy: jest.fn(),
  create: jest.fn((user: Partial<User>) => user),
  save: jest.fn((user: User) => Promise.resolve(user)),
  createQueryBuilder: jest.fn(() => queryBuilder),
};

async function createMiljana(): Promise<User> {
  return {
    id: 1,
    username: 'miljana',
    email: 'miljana@example.com',
    passwordHash: await hashPassword('reader123'),
    createdAt: new Date('2026-01-01T09:00:00.000Z'),
    updatedAt: new Date('2026-01-01T09:00:00.000Z'),
    deletedAt: null as unknown as Date,
  };
}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('saves the user with a hashed password and a lower-case email', async () => {
      queryBuilder.getExists.mockResolvedValue(false);

      const user = await service.create('ana', 'Ana@Example.com', 'secret123');

      expect(user.email).toBe('ana@example.com');
      expect(user.passwordHash).not.toBe('secret123');
      expect(await verifyPassword('secret123', user.passwordHash)).toBe(true);
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('throws 409 when the username is taken', async () => {
      queryBuilder.getExists.mockResolvedValueOnce(true);

      await expect(
        service.create('Miljana', 'new@example.com', 'secret123'),
      ).rejects.toThrow(new ConflictException('Username is already taken'));
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('throws 409 when the email is taken', async () => {
      queryBuilder.getExists
        .mockResolvedValueOnce(false) // username is free
        .mockResolvedValueOnce(true); // email is taken

      await expect(
        service.create('ana', 'miljana@example.com', 'secret123'),
      ).rejects.toThrow(new ConflictException('Email is already registered'));
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('also counts soft-deleted users when checking if a name is taken', async () => {
      queryBuilder.getExists.mockResolvedValue(false);

      await service.create('ana', 'ana@example.com', 'secret123');

      expect(queryBuilder.withDeleted).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('returns the user without the password hash', async () => {
      usersRepository.findOneBy.mockResolvedValue(await createMiljana());

      const profile = await service.getProfile(1);

      expect(profile).toEqual({
        id: 1,
        username: 'miljana',
        email: 'miljana@example.com',
        createdAt: '2026-01-01T09:00:00.000Z',
      });
    });

    it('throws 404 when the user does not exist', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getProfile(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('changes the username', async () => {
      usersRepository.findOneBy.mockResolvedValue(await createMiljana());
      queryBuilder.getExists.mockResolvedValue(false);

      const profile = await service.updateProfile(1, { username: 'miljana_c' });

      expect(profile.username).toBe('miljana_c');
    });

    it('throws 409 when another user already has the username', async () => {
      usersRepository.findOneBy.mockResolvedValue(await createMiljana());
      queryBuilder.getExists.mockResolvedValue(true);

      await expect(
        service.updateProfile(1, { username: 'nikola' }),
      ).rejects.toThrow(new ConflictException('Username is already taken'));
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it("ignores the user's own row, so they can change only the letter case", async () => {
      usersRepository.findOneBy.mockResolvedValue(await createMiljana());
      queryBuilder.getExists.mockResolvedValue(false);

      await service.updateProfile(1, { username: 'Miljana' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.id != :ignoredUserId',
        { ignoredUserId: 1 },
      );
    });
  });

  describe('changePassword', () => {
    it('saves the new password when no current password is given', async () => {
      const miljana = await createMiljana();
      usersRepository.findOneBy.mockResolvedValue(miljana);

      await service.changePassword(1, { newPassword: 'newSecret123' });

      expect(await verifyPassword('newSecret123', miljana.passwordHash)).toBe(
        true,
      );
    });

    it('saves the new password when the current password is correct', async () => {
      const miljana = await createMiljana();
      usersRepository.findOneBy.mockResolvedValue(miljana);

      await service.changePassword(1, {
        currentPassword: 'reader123',
        newPassword: 'newSecret123',
      });

      expect(await verifyPassword('newSecret123', miljana.passwordHash)).toBe(
        true,
      );
    });

    it('throws 401 and keeps the old password when the current password is wrong', async () => {
      const miljana = await createMiljana();
      usersRepository.findOneBy.mockResolvedValue(miljana);

      await expect(
        service.changePassword(1, {
          currentPassword: 'wrong-password',
          newPassword: 'newSecret123',
        }),
      ).rejects.toThrow(new UnauthorizedException('Current password is incorrect'));
      expect(usersRepository.save).not.toHaveBeenCalled();
      expect(await verifyPassword('reader123', miljana.passwordHash)).toBe(
        true,
      );
    });
  });
});
