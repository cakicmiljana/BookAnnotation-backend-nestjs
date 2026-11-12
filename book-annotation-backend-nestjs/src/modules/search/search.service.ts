import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { SearchQueryDto } from '../../dtos/search/search-query.dto';
import { SearchResponse } from '../../dtos/search/search.response';

@Injectable()
export class SearchService {
  /** Exact (phase 1) or semantic (phase 2) search within one edition. */
  search(
    userId: number,
    editionId: number,
    query: SearchQueryDto,
  ): Promise<SearchResponse> {
    return notImplemented(userId, editionId, query);
  }
}
