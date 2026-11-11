import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsISBN,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { trim } from '../../common/transforms/string.transforms';

const hasNoWorkId = (dto: UploadEditionDto): boolean =>
  dto.workId === undefined;

/** Text fields of the multipart upload; the file itself is sent as `file`. */
export class UploadEditionDto {
  /** Set when uploading from a book's details page */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  workId?: number;

  /** Required when `workId` is absent */
  @ValidateIf(hasNoWorkId)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title?: string;

  /** Required when `workId` is absent */
  @ValidateIf(hasNoWorkId)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  author?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  language: string;

  /** ISBN-10 or ISBN-13; hyphens allowed */
  @IsOptional()
  @Transform(trim)
  @IsISBN()
  @MaxLength(17)
  isbn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @Max(new Date().getFullYear())
  publicationYear?: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  country?: string;
}
