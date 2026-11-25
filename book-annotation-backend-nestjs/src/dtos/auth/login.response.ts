import { UserResponse } from '../users/user.response';

export class LoginResponse {
  user: UserResponse;
  token: string;
}
