import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { notImplemented } from '../../common/utils/not-implemented';
import { SearchQueryDto } from '../../dtos/search/search-query.dto';
import { SearchResponse } from '../../dtos/search/search.response';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@Controller('editions/:editionId/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** Exact (phase 1) or semantic (phase 2) search within one edition. */
  @Get()
  search(
    @CurrentUser() user: AuthenticatedUser,
    @Param('editionId', ParseIntPipe) editionId: number,
    @Query() query: SearchQueryDto,
  ): Promise<SearchResponse> {
    // return this.searchService.search(user.id, editionId, query);
    return notImplemented(user, editionId, query);
  }
}
