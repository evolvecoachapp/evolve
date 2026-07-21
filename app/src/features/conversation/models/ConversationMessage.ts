import type { MessageRole } from "./MessageRole";
import type { MessageStatus } from "./MessageStatus";

/** One turn in a Conversation aggregate. */
export interface ConversationMessage {
  readonly id: string;
  readonly conversationId: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly status: MessageStatus;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  /** ISO-8601 timestamp. */
  readonly updatedAt: string;
  /** Optional structured failure detail when status is failed. */
  readonly errorCode?: string;
}
