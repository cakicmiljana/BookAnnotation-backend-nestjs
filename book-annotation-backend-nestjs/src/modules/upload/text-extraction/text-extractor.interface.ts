export interface ExtractedText {
  text: string;
  /** Print page count; only known for PDFs */
  pages: number | null;
}

export interface TextExtractor {
  extract(fileContent: Buffer): Promise<ExtractedText>;
}
