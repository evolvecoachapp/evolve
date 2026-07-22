/**
 * Conversation priority score (1–100). Higher = more prominent.
 * Ranking metadata only — not a recommendation or prompt.
 */
export type ConversationPriority = number;

export const CONVERSATION_PRIORITY_MIN = 1;
export const CONVERSATION_PRIORITY_MAX = 100;
export const CONVERSATION_PRIORITY_DEFAULT = 50;

export function isValidConversationPriority(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= CONVERSATION_PRIORITY_MIN &&
    value <= CONVERSATION_PRIORITY_MAX
  );
}
