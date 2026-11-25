import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../../common/utils/password';
import { ChangePasswordDto } from '../../dtos/users/change-password.dto';
import { UpdateProfileDto } from '../../dtos/users/update-profile.dto';
import { UserResponse } from '../../dtos/users/user.response';
import { toUserResponse } from '../../mappers/user.mapper';
import { User } from '../../models/user';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(userId: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: userId });
  }

  // Login accepts a username or an email, in any letter case.
  findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:value)', { value: usernameOrEmail })
      .orWhere('user.email = LOWER(:value)', { value: usernameOrEmail })
      .getOne();
  }

  async create(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    await this.ensureUsernameIsFree(username);
    await this.ensureEmailIsFree(email);

    const user = this.usersRepository.create({
      username,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
    });
    return this.usersRepository.save(user);
  }

  async getProfile(userId: number): Promise<UserResponse> {
    const user = await this.findByIdOrFail(userId);
    return toUserResponse(user);
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<UserResponse> {
    const user = await this.findByIdOrFail(userId);
    await this.ensureUsernameIsFree(dto.username, userId);

    user.username = dto.username;
    const savedUser = await this.usersRepository.save(user);
    return toUserResponse(savedUser);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findByIdOrFail(userId);
    await this.checkCurrentPassword(user, dto.currentPassword);

    user.passwordHash = await hashPassword(dto.newPassword);
    await this.usersRepository.save(user);
  }

  // To make password required, throw here when it is undefined.
  private async checkCurrentPassword(
    user: User,
    currentPassword: string | undefined,
  ): Promise<void> {
    if (currentPassword === undefined) {
      return;
    }

    const isCorrect = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCorrect) {
      throw new UnauthorizedException('Current password is incorrect');
    }
  }

  private async findByIdOrFail(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} was not found`);
    }
    return user;
  }

  // withDeleted(): a soft-deleted user still owns their username.
  // ignoredUserId lets a user keep their own username, e.g. "ana" -> "Ana".
  private async ensureUsernameIsFree(
    username: string,
    ignoredUserId?: number,
  ): Promise<void> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .withDeleted()
      .where('LOWER(user.username) = LOWER(:username)', { username });

    if (ignoredUserId !== undefined) {
      query.andWhere('user.id != :ignoredUserId', { ignoredUserId });
    }

    const isTaken = await query.getExists();
    if (isTaken) {
      throw new ConflictException('Username is already taken');
    }
  }

  private async ensureEmailIsFree(email: string): Promise<void> {
    const isTaken = await this.usersRepository
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.email = LOWER(:email)', { email })
      .getExists();

    if (isTaken) {
      throw new ConflictException('Email is already registered');
    }
  }
}
