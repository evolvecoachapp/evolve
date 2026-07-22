import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";

/**
 * Input for Prompt Composition Engine.
 *
 * Requires ConversationContext. Optionally references CoachingContext and
 * InsightSnapshot (read-only). Does not modify upstream domains.
 */
export interface PromptCompositionInput {
  readonly conversationContext: ConversationContext;
  readonly coachingContext?: CoachingContext;
  readonly insightSnapshot?: InsightSnapshot;
  readonly composedAt?: string;
  readonly packageId?: string;
}
