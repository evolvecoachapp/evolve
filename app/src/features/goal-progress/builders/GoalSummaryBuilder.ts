import type { GoalProgress } from "../models/GoalProgress";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalSummary } from "../models/GoalSummary";
import { freezeSummary } from "../utils/FreezeGoalProgress";
import { uniqueSorted } from "../utils/GoalHelpers";

export function buildGoalSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly GoalProgress[];
  readonly at: string;
}): GoalSummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionCount: input.decisions.length,
    opportunityCount: input.decisions.reduce((n, d) => n + d.opportunities.length, 0),
    triggerCount: input.decisions.reduce((n, d) => n + d.triggers.length, 0),
    categoryKeys: uniqueSorted(input.decisions.map((d) => d.category)),
    signalKeys: uniqueSorted(input.decisions.flatMap((d) => d.signalKeys)),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: input.at,
  });
}
