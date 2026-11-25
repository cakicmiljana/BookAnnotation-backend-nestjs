import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { ExtractedText, TextExtractor } from './text-extractor.interface';

@Injectable()
export class PlainTextExtractor implements TextExtractor {
  extract(fileContent: Buffer): Promise<ExtractedText> {
    // fatal: true makes decode() throw on bytes that are not valid UTF-8.
    const decoder = new TextDecoder('utf-8', { fatal: true });
    try {
      const text = decoder.decode(fileContent);
      return Promise.resolve({ text, pages: null });
    } catch {
      throw new UnsupportedMediaTypeException(
        'Text files must use UTF-8 encoding',
      );
    }
  }
}
