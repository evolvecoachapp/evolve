import type { AdaptationTimelineItem } from "../models/AdaptationTimeline";

export function sortTimelineItems(
  items: readonly AdaptationTimelineItem[],
): readonly AdaptationTimelineItem[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.at < b.at) return -1;
      if (a.at > b.at) return 1;
      return a.id.localeCompare(b.id);
    }),
  );
}

export function timelineSubjectIds(
  items: readonly AdaptationTimelineItem[],
): readonly string[] {
  return Object.freeze([...new Set(items.map((i) => i.subjectId))].sort());
}
