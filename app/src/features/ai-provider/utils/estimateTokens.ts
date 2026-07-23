/**
 * Rough token estimate from text (abstraction helper — not a tokenizer).
 * Uses ~4 characters per token heuristic.
 */
export function estimateTokens(text: string | null | undefined): number {
  if (!text) {
    return 0;
  }
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }
  return Math.max(1, Math.ceil(normalized.length / 4));
}

/**
 * Estimate tokens across multiple text segments.
 */
export function estimateTokensFromParts(
  parts: readonly (string | null | undefined)[],
): number {
  return parts.reduce<number>((sum, part) => sum + estimateTokens(part), 0);
}
