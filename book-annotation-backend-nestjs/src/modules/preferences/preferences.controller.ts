import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { ReadingPreferencesResponse } from '../../dtos/preferences/reading-preferences.response';
import { UpdateReadingPreferencesDto } from '../../dtos/preferences/update-reading-preferences.dto';
import { PreferencesService } from './preferences.service';

@ApiTags('preferences')
@ApiBearerAuth()
@Controller('me/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  get(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReadingPreferencesResponse> {
    // return this.preferencesService.get(user.id);
    return notImplemented(user);
  }

  @Put()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateReadingPreferencesDto,
  ): Promise<ReadingPreferencesResponse> {
    // return this.preferencesService.upsert(user.id, dto);
    return notImplemented(user, dto);
  }
}
