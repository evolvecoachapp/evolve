import type { ConversationIntent } from "./ConversationIntent";
import type { ConversationMetadata } from "./ConversationMetadata";
import type { ConversationPriority } from "./ConversationPriority";
import type { ConversationReason } from "./ConversationReason";

/**
 * Deterministic conversation goal derived from coaching objectives.
 * Structured orchestration fact — not advice language.
 */
export interface ConversationGoal {
  readonly id: string;
  readonly intent: ConversationIntent;
  readonly priority: ConversationPriority;
  readonly title: string;
  readonly statement: string;
  readonly reason: ConversationReason;
  readonly evidenceIds: readonly string[];
  readonly objectiveIds: readonly string[];
  readonly metadata: ConversationMetadata;
}
