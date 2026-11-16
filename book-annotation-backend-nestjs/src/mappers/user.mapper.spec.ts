import { User } from '../models/user';
import { toUserResponse } from './user.mapper';

describe('toUserResponse', () => {
  const user: User = {
    id: 1,
    username: 'miljana',
    email: 'miljana@example.com',
    passwordHash: '$2b$10$secret-hash-that-must-never-leak',
    createdAt: new Date('2026-01-01T09:00:00.000Z'),
    updatedAt: new Date('2026-11-16T10:00:00.000Z'),
    deletedAt: new Date('2026-11-16T11:00:00.000Z'),
  };

  it('returns exactly id, username, email and createdAt as an ISO string', () => {
    expect(toUserResponse(user)).toEqual({
      id: 1,
      username: 'miljana',
      email: 'miljana@example.com',
      createdAt: '2026-01-01T09:00:00.000Z',
    });
  });

  it('never exposes passwordHash or deletedAt', () => {
    const json = JSON.stringify(toUserResponse(user));

    expect(json).not.toContain('passwordHash');
    expect(json).not.toContain('secret-hash');
    expect(json).not.toContain('deletedAt');
  });
});
