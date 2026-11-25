import { ReadingPreferencesResponse } from '../dtos/preferences/reading-preferences.response';
import { ReadingPreferences } from '../models/reading-preferences';

export const toReadingPreferencesResponse = (
  preferences: ReadingPreferences,
): ReadingPreferencesResponse => ({
  fontFamily: preferences.fontFamily,
  fontSize: preferences.fontSize,
  lineHeight: preferences.lineHeight,
  readingWidth: preferences.readingWidth,
  theme: preferences.theme,
  showHighlights: preferences.showHighlights,
  updatedAt: preferences.updatedAt.toISOString(),
});
