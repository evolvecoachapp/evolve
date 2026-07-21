/**
 * Interactive session window within a Conversation.
 *
 * Tracks when the user opened/closed an active coaching turn sequence.
 */
export interface ConversationSession {
  readonly id: string;
  readonly conversationId: string;
  /** ISO-8601 timestamp. */
  readonly startedAt: string;
  /** ISO-8601 timestamp when the session ended, if closed. */
  readonly endedAt: string | null;
}
