import type { ConversationPriority } from "./ConversationPriority";
import type { ConversationReason } from "./ConversationReason";

/**
 * Deterministic conversation constraint derived from coaching constraints.
 * Domain fact — not a conversational warning.
 */
export interface ConversationConstraint {
  readonly id: string;
  readonly code: string;
  readonly statement: string;
  readonly sourceType: string;
  readonly sourceId: string;
  readonly priority: ConversationPriority;
  readonly reason: ConversationReason;
}
