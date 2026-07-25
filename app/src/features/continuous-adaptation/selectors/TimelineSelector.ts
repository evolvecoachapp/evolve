import type { AdaptationTimeline, AdaptationTimelineItem } from "../models/AdaptationTimeline";

export function selectTimelineItemsByOperation(
  timeline: AdaptationTimeline | null,
  operation: string,
): readonly AdaptationTimelineItem[] {
  if (!timeline) return Object.freeze([]);
  return Object.freeze(timeline.items.filter((i) => i.operation === operation));
}
