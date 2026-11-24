import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';
import { EditionUploadService } from './edition-upload.service';

// POST /api/editions lives in its own module, because uploading needs both
// EditionsService and WorksService (and WorksModule already uses EditionsModule).
@ApiTags('editions')
@ApiBearerAuth()
@Controller('editions')
export class UploadController {
  constructor(private readonly editionUploadService: EditionUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'language'],
      properties: {
        file: { type: 'string', format: 'binary' },
        workId: { type: 'integer' },
        title: { type: 'string' },
        author: { type: 'string' },
        language: { type: 'string' },
        isbn: { type: 'string' },
        description: { type: 'string' },
        publicationYear: { type: 'integer' },
        country: { type: 'string' },
      },
    },
  })
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadEditionDto,
  ): Promise<EditionResponse> {
    return this.editionUploadService.upload(user.id, file, dto);
  }
}
