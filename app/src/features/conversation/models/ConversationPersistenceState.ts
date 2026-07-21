import type { ConversationPersistenceVersion } from "./ConversationPersistenceVersion";
import type { ConversationStreamStatus } from "./ConversationStreamStatus";

/** Lifecycle of a conversation relative to durable storage. */
export type ConversationPersistenceLifecycle =
  | "absent"
  | "restored"
  | "persisted"
  | "cleared"
  | "invalid";

/**
 * Bookkeeping for conversation persistence — no AI internals.
 */
export interface ConversationPersistenceState {
  readonly lifecycle: ConversationPersistenceLifecycle;
  readonly conversationId: string | null;
  readonly schemaVersion: ConversationPersistenceVersion;
  readonly streamStatus: ConversationStreamStatus;
  /** ISO-8601 timestamp of the last successful save, if any. */
  readonly lastSavedAt: string | null;
}
