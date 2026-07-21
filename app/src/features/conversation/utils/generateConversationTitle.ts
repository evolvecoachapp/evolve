const DEFAULT_TITLE = "New conversation";
const MAX_TITLE_LENGTH = 48;

/**
 * Derive a short conversation title from the first user message content.
 *
 * Deterministic, no markdown, no networking.
 */
export function generateConversationTitle(
  firstUserMessage: string | null | undefined,
): string {
  if (!firstUserMessage) {
    return DEFAULT_TITLE;
  }

  const normalized = firstUserMessage.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) {
    return DEFAULT_TITLE;
  }

  if (normalized.length <= MAX_TITLE_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`;
}
