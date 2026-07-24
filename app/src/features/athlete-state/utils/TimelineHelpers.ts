import type { AthleteTimeline } from "../models/AthleteTimeline";

export function timelineLength(timeline: AthleteTimeline): number {
  return timeline.items.length;
}

export function lastTimelineOccurredAt(
  timeline: AthleteTimeline,
): string | null {
  const last = timeline.items[timeline.items.length - 1];
  return last?.occurredAt ?? null;
}
