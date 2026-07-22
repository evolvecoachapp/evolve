import type { ConversationIntent } from "./ConversationIntent";
import type { ConversationStage } from "./ConversationStage";
import type { ConversationState } from "./ConversationState";

/**
 * Compact public summary of a Conversation Context.
 */
export interface ConversationSummary {
  readonly contextId: string;
  readonly athleteId: string | null;
  readonly goalCount: number;
  readonly constraintCount: number;
  readonly evidenceCount: number;
  readonly turnCount: number;
  readonly messageCount: number;
  readonly topGoalIds: readonly string[];
  readonly primaryIntent: ConversationIntent | null;
  readonly state: ConversationState;
  readonly stage: ConversationStage;
  readonly summaryText: string;
}
