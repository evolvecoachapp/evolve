import type { GoalProgress } from "../models/GoalProgress";
import { GoalCategories } from "../models/GoalCategory";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { ContinuousAdaptationInput } from "../models/ContinuousAdaptationInput";
import { freezeContinuousAdaptationHandoff } from "../utils/FreezeGoalProgress";
import { uniqueSorted } from "../utils/GoalHelpers";

/**
 * Build Continuous Adaptation handoff from evaluated goal progress.
 * Handoff only — does not modify goals or plans.
 */
export function buildContinuousAdaptationInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly GoalProgress[];
  readonly at: string;
}): ContinuousAdaptationInput {
  const decisionIds = Object.freeze(input.decisions.map((d) => d.id));
  const signalKeys = uniqueSorted(input.decisions.flatMap((d) => d.signalKeys));
  const categoryKeys = uniqueSorted([
    GoalCategories.GOAL,
    ...input.decisions.map((d) => d.category),
  ]);
  return freezeContinuousAdaptationHandoff({
    id: `handoff:continuous-adaptation:${input.contextId}`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionIds,
    signalKeys,
    categoryKeys,
    metadata: EMPTY_GOAL_METADATA,
    createdAt: input.at,
  });
}
