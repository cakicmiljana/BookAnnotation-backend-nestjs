import { UserResponse } from '../dtos/users/user.response';
import { User } from '../models/user';

export const toUserResponse = (user: User): UserResponse => ({
  id: user.id,
  username: user.username,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});
