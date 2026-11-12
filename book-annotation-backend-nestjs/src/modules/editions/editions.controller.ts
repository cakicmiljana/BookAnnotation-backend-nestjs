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
import { EditionContentResponse } from '../../dtos/editions/edition-content.response';
import { EditionQueryDto } from '../../dtos/editions/edition-query.dto';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { UploadEditionDto } from '../../dtos/editions/upload-edition.dto';
import { EditionUploadService } from './edition-upload.service';
import { EditionsService } from './editions.service';

@ApiTags('editions')
@ApiBearerAuth()
@Controller('editions')
export class EditionsController {
  constructor(
    private readonly editionsService: EditionsService,
    private readonly editionUploadService: EditionUploadService,
  ) {}

  @Get()
  getAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: EditionQueryDto,
  ): Promise<EditionResponse[]> {
    return this.editionsService.findAllAccessible(user.id, query);
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EditionResponse> {
    return this.editionsService.findOne(user.id, id);
  }

  @Get(':id/content')
  getContent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EditionContentResponse> {
    return this.editionsService.getContent(user.id, id);
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
    return this.editionUploadService.upload(user.id, file, dto);
  }
}
