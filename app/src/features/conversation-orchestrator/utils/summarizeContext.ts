import type { ConversationContext } from "../models/ConversationContext";
import type { ConversationGoal } from "../models/ConversationGoal";
import type { ConversationIntent } from "../models/ConversationIntent";
import type { ConversationStage } from "../models/ConversationStage";
import type { ConversationState } from "../models/ConversationState";
import type { ConversationSummary } from "../models/ConversationSummary";
import { formatCountPhrase, formatIntentLabel } from "./formatting";

function primaryIntent(
  goals: readonly ConversationGoal[],
): ConversationIntent | null {
  if (goals.length === 0) {
    return null;
  }
  return goals[0].intent;
}

/**
 * Build a compact ConversationSummary from context parts.
 */
export function buildConversationSummary(options: {
  readonly contextId: string;
  readonly athleteId: string | null;
  readonly goals: readonly ConversationGoal[];
  readonly constraintCount: number;
  readonly evidenceCount: number;
  readonly turnCount: number;
  readonly messageCount: number;
  readonly state: ConversationState;
  readonly stage: ConversationStage;
  readonly topLimit?: number;
}): ConversationSummary {
  const topLimit = options.topLimit ?? 3;
  const primary = primaryIntent(options.goals);
  const topGoalIds = options.goals.slice(0, topLimit).map((goal) => goal.id);

  const intentPhrase = primary
    ? ` Primary intent: ${formatIntentLabel(primary)}.`
    : "";

  return Object.freeze({
    contextId: options.contextId,
    athleteId: options.athleteId,
    goalCount: options.goals.length,
    constraintCount: options.constraintCount,
    evidenceCount: options.evidenceCount,
    turnCount: options.turnCount,
    messageCount: options.messageCount,
    topGoalIds: Object.freeze([...topGoalIds]),
    primaryIntent: primary,
    state: options.state,
    stage: options.stage,
    summaryText: `${formatCountPhrase(
      options.goals.length,
      "conversation goal",
    )}.${intentPhrase}`,
  });
}

export function summarizeFromContext(
  context: ConversationContext,
): ConversationSummary {
  return context.summary;
}
