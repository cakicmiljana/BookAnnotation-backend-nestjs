import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { GetLibraryItemResponse } from '../../dtos/library/get-library-item.response';
import { UpdateReadingPositionDto } from '../../dtos/library/update-reading-position.dto';
import { LibraryService } from './library.service';

@ApiTags('library')
@ApiBearerAuth()
@Controller('me/library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  /** Sorted by lastOpenedAt DESC NULLS LAST, then addedAt DESC. */
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetLibraryItemResponse[]> {
    return this.libraryService.findAll(user.id);
  }

  @Put(':editionId')
  add(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
  ): Promise<GetLibraryItemResponse> {
    return this.libraryService.add(user.id, editionId);
  }

  /** Removes the entry only; annotations and notes stay. */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':editionId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
  ): Promise<void> {
    return this.libraryService.remove(user.id, editionId);
  }

  @Put(':editionId/position')
  updatePosition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Body() dto: UpdateReadingPositionDto,
  ): Promise<GetLibraryItemResponse> {
    return this.libraryService.updatePosition(user.id, editionId, dto.offset);
  }
}
