const BYTE_ORDER_MARK = 0xfeff;
const WINDOWS_OR_OLD_MAC_LINE_BREAK = /\r\n?/g;

/**
 * Normalizes an edition's text once, before it is stored (spec 5.1).
 * Annotation offsets point into the result, so it must never change afterwards.
 */
export function normalizeText(raw: string): string {
  const withoutBom = raw.charCodeAt(0) === BYTE_ORDER_MARK ? raw.slice(1) : raw;
  return withoutBom.replace(WINDOWS_OR_OLD_MAC_LINE_BREAK, '\n').trimEnd();
}
