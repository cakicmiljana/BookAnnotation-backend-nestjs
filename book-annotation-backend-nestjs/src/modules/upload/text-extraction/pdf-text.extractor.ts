import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { ExtractedText, TextExtractor } from './text-extractor.interface';

@Injectable()
export class PdfTextExtractor implements TextExtractor {
  async extract(fileContent: Buffer): Promise<ExtractedText> {
    const parser = new PDFParse({ data: fileContent });
    try {
      // pageJoiner '' stops pdf-parse from adding "-- 1 of 10 --" between pages.
      const result = await parser.getText({ pageJoiner: '' });
      return { text: result.text, pages: result.total };
    } catch {
      throw new BadRequestException('The file contains no readable text');
    } finally {
      await parser.destroy();
    }
  }
}
