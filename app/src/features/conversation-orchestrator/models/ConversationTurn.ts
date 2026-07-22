import type { ConversationIntent } from "./ConversationIntent";
import type { ConversationPriority } from "./ConversationPriority";

/**
 * Structural conversation turn for orchestration sequencing.
 * Not a generated reply — turn metadata only.
 */
export interface ConversationTurn {
  readonly id: string;
  readonly index: number;
  readonly intent: ConversationIntent;
  readonly priority: ConversationPriority;
  readonly goalIds: readonly string[];
  readonly messageIds: readonly string[];
  readonly statement: string;
}
