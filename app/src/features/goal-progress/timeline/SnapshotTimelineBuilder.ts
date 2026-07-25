import type { GoalProgress } from "../models/GoalProgress";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalSnapshot } from "../models/GoalSnapshot";
import type { GoalSummary } from "../models/GoalSummary";
import { freezeSnapshot } from "../utils/FreezeGoalProgress";
import { uniqueSorted } from "../utils/GoalHelpers";

export function buildTimelineSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly GoalProgress[];
  readonly summary: GoalSummary | null;
  readonly at: string;
}): GoalSnapshot {
  const signalKeys = uniqueSorted(input.decisions.flatMap((d) => d.signalKeys));
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisions: input.decisions,
    summary: input.summary,
    signalKeys,
    metadata: EMPTY_GOAL_METADATA,
    createdAt: input.at,
  });
}
