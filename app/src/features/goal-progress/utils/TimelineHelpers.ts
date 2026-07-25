import type { GoalTimelineItem } from "../models/GoalTimeline";

export function sortTimelineItems(
  items: readonly GoalTimelineItem[],
): readonly GoalTimelineItem[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.at < b.at) return -1;
      if (a.at > b.at) return 1;
      return a.id.localeCompare(b.id);
    }),
  );
}

export function timelineSubjectIds(
  items: readonly GoalTimelineItem[],
): readonly string[] {
  return Object.freeze([...new Set(items.map((i) => i.subjectId))].sort());
}
