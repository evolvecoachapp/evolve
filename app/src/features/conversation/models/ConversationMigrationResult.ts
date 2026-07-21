import type { ConversationSnapshot } from "./ConversationSnapshot";
import type { ConversationPersistenceVersion } from "./ConversationPersistenceVersion";

/** Structured outcome of a snapshot migration attempt — never throws. */
export interface ConversationMigrationResult {
  readonly success: boolean;
  readonly fromVersion: ConversationPersistenceVersion | null;
  readonly toVersion: ConversationPersistenceVersion;
  readonly snapshot: ConversationSnapshot | null;
  /** Machine-readable failure reason when success is false. */
  readonly reason: string | null;
}
