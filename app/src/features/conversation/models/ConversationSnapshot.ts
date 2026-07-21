import type { ConversationMessage } from "./ConversationMessage";
import type { ConversationMetadata } from "./ConversationMetadata";
import type { ConversationPersistenceVersion } from "./ConversationPersistenceVersion";
import type { ConversationSession } from "./ConversationSession";
import type { ConversationStatus } from "./ConversationStatus";
import type { ConversationStreamStatus } from "./ConversationStreamStatus";

/**
 * Durable, AI-agnostic conversation snapshot.
 *
 * No provider payloads, embeddings, or prompt internals.
 */
export interface ConversationSnapshot {
  readonly id: string;
  readonly status: ConversationStatus;
  readonly messages: readonly ConversationMessage[];
  readonly metadata: ConversationMetadata;
  readonly session: ConversationSession;
  readonly streamStatus: ConversationStreamStatus;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  /** ISO-8601 timestamp. */
  readonly updatedAt: string;
  readonly schemaVersion: ConversationPersistenceVersion;
}
