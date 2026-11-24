import { UnsupportedMediaTypeException } from '@nestjs/common';
import { extname } from 'node:path';
import { SourceFormat } from '../../models/enums/source-format.enum';

const PDF_MAGIC_BYTES = '%PDF-';

/**
 * Decides whether the upload is a PDF or a plain text file.
 * The extension, the MIME type and the file's first bytes must all agree, otherwise 415.
 */
export function detectSourceFormat(file: Express.Multer.File): SourceFormat {
  const extension = extname(file.originalname).toLowerCase();
  const looksLikePdf = startsWithPdfMagicBytes(file.buffer);

  if (
    extension === '.pdf' &&
    file.mimetype === 'application/pdf' &&
    looksLikePdf
  ) {
    return SourceFormat.Pdf;
  }
  if (extension === '.txt' && file.mimetype === 'text/plain' && !looksLikePdf) {
    return SourceFormat.Txt;
  }
  throw new UnsupportedMediaTypeException(
    'Only .pdf and .txt files are accepted',
  );
}

function startsWithPdfMagicBytes(fileContent: Buffer): boolean {
  return (
    fileContent.subarray(0, PDF_MAGIC_BYTES.length).toString('latin1') ===
    PDF_MAGIC_BYTES
  );
}
