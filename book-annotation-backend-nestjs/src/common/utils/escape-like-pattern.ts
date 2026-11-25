// In SQL LIKE / ILIKE, "%" and "_" are wildcards and "\" escapes them.
// Escaping all three makes the user's text match literally.
export function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}
