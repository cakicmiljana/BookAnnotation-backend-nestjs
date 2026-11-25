import { AnalysisLens } from '../../models/enums/analysis-lens.enum';

export class AnalyzedPassageResponse {
  startOffset: number;
  endOffset: number;
  text: string;
}

export class PassageAnalysisResponse {
  lens: AnalysisLens;
  /** Short heading */
  title: string;
  /** 1–3 paragraphs */
  interpretation: string;
  /** 2–5 short labels, rendered as chips */
  themes: string[];
  /** "Motifs to follow" */
  motifs: string;
  /** A short quote from the passage ("Textual evidence") */
  evidence: string;
  /** "A question for your reading" */
  question: string;
  passage: AnalyzedPassageResponse;
}
