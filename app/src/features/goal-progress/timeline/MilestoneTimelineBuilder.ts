import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalTimelineItem } from "../models/GoalTimeline";
import { freezeTimelineItem } from "../utils/FreezeGoalProgress";
import { uniqueSorted } from "../utils/GoalHelpers";

/**
 * Historical organization of trend signal keys only — no forecasting.
 */
export function buildTrendItems(input: {
  readonly trendKeys: readonly string[];
  readonly at: string;
}): readonly GoalTimelineItem[] {
  const keys = uniqueSorted(input.trendKeys.filter((k) => k.includes("trend")));
  return Object.freeze(
    keys.map((k, i) =>
      freezeTimelineItem({
        id: `trend-item:${i}:${k}`,
        subjectId: k,
        operation: "trend_signal",
        at: input.at,
        metadata: EMPTY_GOAL_METADATA,
      }),
    ),
  );
}
