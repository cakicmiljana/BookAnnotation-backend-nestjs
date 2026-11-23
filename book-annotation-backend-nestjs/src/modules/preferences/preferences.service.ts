import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingPreferencesResponse } from '../../dtos/preferences/reading-preferences.response';
import { UpdateReadingPreferencesDto } from '../../dtos/preferences/update-reading-preferences.dto';
import { toReadingPreferencesResponse } from '../../mappers/reading-preferences.mapper';
import { FontFamily } from '../../models/enums/font-family.enum';
import { ReadingWidth } from '../../models/enums/reading-width.enum';
import { Theme } from '../../models/enums/theme.enum';
import { ReadingPreferences } from '../../models/reading-preferences';

// Used until the user saves preferences for the first time.
// Keep in sync with the column defaults in models/reading-preferences.ts.
const DEFAULT_PREFERENCES = {
  fontFamily: FontFamily.Serif,
  fontSize: 21,
  lineHeight: 1.85,
  readingWidth: ReadingWidth.Comfortable,
  theme: Theme.Paper,
  showHighlights: true,
};

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(ReadingPreferences)
    private readonly preferencesRepository: Repository<ReadingPreferences>,
  ) {}

  // No row is created by reading; the defaults are returned instead.
  async get(userId: number): Promise<ReadingPreferencesResponse> {
    const preferences = await this.preferencesRepository.findOneBy({ userId });
    if (!preferences) {
      return { ...DEFAULT_PREFERENCES, updatedAt: null };
    }
    return toReadingPreferencesResponse(preferences);
  }

  // Only the fields sent in the request change. The first save creates the row.
  async upsert(
    userId: number,
    dto: UpdateReadingPreferencesDto,
  ): Promise<ReadingPreferencesResponse> {
    const existing = await this.preferencesRepository.findOneBy({ userId });
    const preferences =
      existing ??
      this.preferencesRepository.create({ userId, ...DEFAULT_PREFERENCES });

    // The DTO contains only the fields that were sent, so only those change.
    Object.assign(preferences, dto);

    const saved = await this.preferencesRepository.save(preferences);
    return toReadingPreferencesResponse(saved);
  }
}
