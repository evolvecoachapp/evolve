import type { GoalTimeline, GoalTimelineItem } from "../models/GoalTimeline";

export function selectTimelineItemsByOperation(
  timeline: GoalTimeline | null,
  operation: string,
): readonly GoalTimelineItem[] {
  if (!timeline) return Object.freeze([]);
  return Object.freeze(timeline.items.filter((i) => i.operation === operation));
}
