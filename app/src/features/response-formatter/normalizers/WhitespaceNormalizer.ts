/**
 * Normalize whitespace deterministically.
 */
export class WhitespaceNormalizer {
  normalize(text: string): string {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
}

export const whitespaceNormalizer = new WhitespaceNormalizer();
