export class PassageResultResponse {
  /** Passage start in the full text (the frontend's PassagePreview.offset) */
  offset: number;
  endOffset: number;
  /** Passage text, cut to 360 characters */
  text: string;
  /** Exact mode: absolute offset where the match starts */
  matchStart?: number;
  /** Exact mode: absolute offset where the match ends (exclusive) */
  matchEnd?: number;
  /** Semantic mode: similarity from 0 to 1 */
  score?: number;
}
