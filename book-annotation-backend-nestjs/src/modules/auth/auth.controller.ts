import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { LoginDto } from '../../dtos/auth/login.dto';
import { LoginResponse } from '../../dtos/auth/login.response';
import { RegisterDto } from '../../dtos/auth/register.dto';
import { UserResponse } from '../../dtos/users/user.response';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // TODO: @UseGuards(LocalAuthGuard) and @Throttle (5 per minute per IP)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@CurrentUser() user: AuthenticatedUser): Promise<LoginResponse> {
    return this.authService.issueToken(user);
  }

  // TODO: @Throttle
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    return this.usersService.getProfile(user.id);
  }
}
