import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { ChangePasswordDto } from '../../dtos/users/change-password.dto';
import { UpdateProfileDto } from '../../dtos/users/update-profile.dto';
import { UserResponse } from '../../dtos/users/user.response';

@Injectable()
export class UsersService {
  getProfile(userId: number): Promise<UserResponse> {
    return notImplemented(userId);
  }

  updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserResponse> {
    return notImplemented(userId, dto);
  }

  changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    return notImplemented(userId, dto);
  }
}
