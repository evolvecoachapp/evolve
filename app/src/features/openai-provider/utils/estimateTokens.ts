/**
 * Rough token estimate from text (~4 characters per token).
 * Provider-layer helper only — not a tokenizer.
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

export function estimateTokensFromParts(
  parts: readonly (string | null | undefined)[],
): number {
  return parts.reduce<number>((sum, part) => sum + estimateTokens(part), 0);
}

export function estimateMessageTokens(
  messages: readonly { readonly content: string }[],
): number {
  return estimateTokensFromParts(messages.map((message) => message.content));
}
