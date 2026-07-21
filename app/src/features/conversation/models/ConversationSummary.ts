import type { ConversationStatus } from "./ConversationStatus";

/** Lightweight list projection of a Conversation. */
export interface ConversationSummary {
  readonly id: string;
  readonly title: string;
  readonly status: ConversationStatus;
  readonly messageCount: number;
  /** ISO-8601 timestamp of the most recent message, if any. */
  readonly lastMessageAt: string | null;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  /** ISO-8601 timestamp. */
  readonly updatedAt: string;
}
