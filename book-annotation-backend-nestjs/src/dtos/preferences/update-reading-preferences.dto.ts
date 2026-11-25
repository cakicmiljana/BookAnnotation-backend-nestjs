import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { FontFamily } from '../../models/enums/font-family.enum';
import { ReadingWidth } from '../../models/enums/reading-width.enum';
import { Theme } from '../../models/enums/theme.enum';

export class UpdateReadingPreferencesDto {
  @IsOptional()
  @IsEnum(FontFamily)
  fontFamily?: FontFamily;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(30)
  fontSize?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1.4)
  @Max(2.2)
  lineHeight?: number;

  @IsOptional()
  @IsEnum(ReadingWidth)
  readingWidth?: ReadingWidth;

  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @IsOptional()
  @IsBoolean()
  showHighlights?: boolean;
}
