import type { ConversationContext } from "./ConversationContext";
import type { ConversationSnapshot } from "./ConversationSnapshot";
import type { ConversationSummary } from "./ConversationSummary";

/**
 * Frozen Conversation Orchestrator engine result.
 */
export interface ConversationEngineResult {
  readonly snapshot: ConversationSnapshot;
  readonly context: ConversationContext;
  readonly summary: ConversationSummary;
  readonly validationIssues: readonly string[];
}
