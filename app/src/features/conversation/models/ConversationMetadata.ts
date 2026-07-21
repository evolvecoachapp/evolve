/**
 * Denormalized conversation descriptors for listing and headers.
 *
 * No markdown, prose, or provider-specific fields.
 */
export interface ConversationMetadata {
  readonly title: string;
  readonly messageCount: number;
  /** ISO-8601 timestamp of the most recent message, if any. */
  readonly lastMessageAt: string | null;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  /** ISO-8601 timestamp. */
  readonly updatedAt: string;
}
