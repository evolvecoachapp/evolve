import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalTimeline } from "../models/GoalTimeline";
import type { GoalTrend } from "../models/GoalTrend";
import { freezeWindow } from "../utils/FreezeGoalProgress";

export function buildGoalTrend(input: {
  readonly id: string;
  readonly timeline: GoalTimeline | null;
  readonly startAt: string;
  readonly endAt: string;
}): GoalTrend {
  const itemIds = input.timeline
    ? input.timeline.items
        .filter((i) => i.at >= input.startAt && i.at <= input.endAt)
        .map((i) => i.id)
    : [];
  return freezeWindow({
    id: input.id,
    startAt: input.startAt,
    endAt: input.endAt,
    itemIds: Object.freeze(itemIds),
    metadata: EMPTY_GOAL_METADATA,
  });
}
