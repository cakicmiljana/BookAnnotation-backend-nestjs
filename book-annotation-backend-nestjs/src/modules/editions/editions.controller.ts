import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { EditionContentResponse } from '../../dtos/editions/edition-content.response';
import { EditionQueryDto } from '../../dtos/editions/edition-query.dto';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';
import { EditionsService } from './editions.service';

@ApiTags('editions')
@ApiBearerAuth()
@Controller('editions')
export class EditionsController {
  constructor(private readonly editionsService: EditionsService) {}

  @Get()
  getAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: EditionQueryDto,
  ): Promise<EditionResponse[]> {
    // return this.editionsService.findAllAccessible(user.id, query);
    return notImplemented(user, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EditionResponse> {
    // return this.editionsService.findOne(id, user.id);
    return notImplemented(user, id);
  }

  @Get(':id/content')
  getContent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EditionContentResponse> {
    // return this.editionsService.getContent(id, user.id);
    return notImplemented(user, id);
  }

  // TODO: @Throttle; FileInterceptor limits.fileSize from UPLOAD_MAX_BYTES (413)
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
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadEditionDto,
  ): Promise<EditionResponse> {
    // return this.editionUploadService.upload(user.id, file, dto);
    return notImplemented(user, file, dto);
  }
}
