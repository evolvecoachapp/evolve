import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalProgress } from "../models/GoalProgress";
import type { GoalTimeline, GoalTimelineItem } from "../models/GoalTimeline";
import { freezeTimeline, freezeTimelineItem } from "../utils/FreezeGoalProgress";
import { sortTimelineItems } from "../utils/TimelineHelpers";

export function buildGoalTimeline(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly decisions: readonly GoalProgress[];
  readonly at: string;
}): GoalTimeline {
  const items: GoalTimelineItem[] = input.decisions.map((d) =>
    freezeTimelineItem({
      id: `tl-item:${d.id}`,
      subjectId: d.id,
      operation: "adaptation_decision",
      at: d.createdAt,
      metadata: EMPTY_GOAL_METADATA,
    }),
  );
  return freezeTimeline({
    id: input.id,
    athleteId: input.athleteId,
    items: sortTimelineItems(items),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: input.at,
  });
}
