import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { ChangePasswordDto } from '../../dtos/users/change-password.dto';
import { UpdateProfileDto } from '../../dtos/users/update-profile.dto';
import { UserResponse } from '../../dtos/users/user.response';
import { UsersService } from './users.service';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    return this.usersService.getProfile(user.id);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponse> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('password')
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(user.id, dto);
  }
}
