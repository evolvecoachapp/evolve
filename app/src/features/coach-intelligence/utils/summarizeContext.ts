import type { CoachingContext } from "../models/CoachingContext";
import type { CoachIntent } from "../models/CoachIntent";
import type { CoachObjective } from "../models/CoachObjective";
import type { CoachingContextSummary } from "../models/CoachingContextSummary";
import { formatCountPhrase, formatIntentLabel } from "./formatting";

function primaryIntent(
  objectives: readonly CoachObjective[],
): CoachIntent | null {
  if (objectives.length === 0) {
    return null;
  }
  return objectives[0].intent;
}

/**
 * Build a compact CoachingContextSummary from context parts.
 */
export function buildCoachingContextSummary(options: {
  readonly contextId: string;
  readonly athleteId: string | null;
  readonly objectives: readonly CoachObjective[];
  readonly constraintCount: number;
  readonly instructionCount: number;
  readonly focusCount: number;
  readonly evidenceCount: number;
  readonly topLimit?: number;
}): CoachingContextSummary {
  const topLimit = options.topLimit ?? 3;
  const primary = primaryIntent(options.objectives);
  const topObjectiveIds = options.objectives
    .slice(0, topLimit)
    .map((objective) => objective.id);

  const intentPhrase = primary
    ? ` Primary intent: ${formatIntentLabel(primary)}.`
    : "";

  return Object.freeze({
    contextId: options.contextId,
    athleteId: options.athleteId,
    objectiveCount: options.objectives.length,
    constraintCount: options.constraintCount,
    instructionCount: options.instructionCount,
    focusCount: options.focusCount,
    evidenceCount: options.evidenceCount,
    topObjectiveIds: Object.freeze([...topObjectiveIds]),
    primaryIntent: primary,
    summaryText: `${formatCountPhrase(
      options.objectives.length,
      "coaching objective",
    )}.${intentPhrase}`,
  });
}

export function summarizeFromContext(
  context: CoachingContext,
): CoachingContextSummary {
  return context.summary;
}
