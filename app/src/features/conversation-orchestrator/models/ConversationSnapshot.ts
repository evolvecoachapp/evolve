import type { ConversationContext } from "./ConversationContext";
import type { ConversationSummary } from "./ConversationSummary";

/**
 * Immutable conversation context snapshot — frozen orchestration artifact.
 * No persistence. No prompts. Deterministic domain context only.
 */
export interface ConversationSnapshot {
  readonly id: string;
  readonly context: ConversationContext;
  readonly summary: ConversationSummary;
  readonly frozenAt: string;
}
