import { PassageResultResponse } from './passage-result.response';
import { SearchMode } from './search-mode.enum';

export class SearchResponse {
  mode: SearchMode;
  /** Exact: number of occurrences; semantic: number of results returned */
  total: number;
  results: PassageResultResponse[];
}
