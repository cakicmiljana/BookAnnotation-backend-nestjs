import { FontFamily } from '../../models/enums/font-family.enum';
import { ReadingWidth } from '../../models/enums/reading-width.enum';
import { Theme } from '../../models/enums/theme.enum';

export class ReadingPreferencesResponse {
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  readingWidth: ReadingWidth;
  theme: Theme;
  showHighlights: boolean;
  /** `null` when the user has not saved preferences yet (defaults are returned) */
  updatedAt: string | null;
}
