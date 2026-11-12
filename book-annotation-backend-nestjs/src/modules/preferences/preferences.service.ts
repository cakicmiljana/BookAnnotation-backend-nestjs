import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { ReadingPreferencesResponse } from '../../dtos/preferences/reading-preferences.response';
import { UpdateReadingPreferencesDto } from '../../dtos/preferences/update-reading-preferences.dto';

@Injectable()
export class PreferencesService {
  /** Returns the defaults when the user has not saved preferences yet. */
  get(userId: number): Promise<ReadingPreferencesResponse> {
    return notImplemented(userId);
  }

  upsert(
    userId: number,
    dto: UpdateReadingPreferencesDto,
  ): Promise<ReadingPreferencesResponse> {
    return notImplemented(userId, dto);
  }
}
