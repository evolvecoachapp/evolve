import type { ConversationMessage } from "./ConversationMessage";
import type { ConversationMetadata } from "./ConversationMetadata";
import type { ConversationSession } from "./ConversationSession";
import type { ConversationStatus } from "./ConversationStatus";

/** Aggregate root for provider-agnostic AI conversation state. */
export interface Conversation {
  readonly id: string;
  readonly status: ConversationStatus;
  readonly messages: readonly ConversationMessage[];
  readonly metadata: ConversationMetadata;
  readonly session: ConversationSession;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  /** ISO-8601 timestamp. */
  readonly updatedAt: string;
}
