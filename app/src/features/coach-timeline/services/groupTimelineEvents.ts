import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import type { CoachTimelineEventCategory } from "../models/CoachTimelineEvent";

/**
 * Group timeline entries by event category. One responsibility only.
 */
export function groupTimelineEvents(
  entries: readonly CoachTimelineEntry[],
): ReadonlyMap<CoachTimelineEventCategory, readonly CoachTimelineEntry[]> {
  const groups = new Map<
    CoachTimelineEventCategory,
    CoachTimelineEntry[]
  >();

  for (const entry of entries) {
    const bucket = groups.get(entry.event.category) ?? [];
    bucket.push(entry);
    groups.set(entry.event.category, bucket);
  }

  const frozen = new Map<
    CoachTimelineEventCategory,
    readonly CoachTimelineEntry[]
  >();
  for (const [category, bucket] of groups) {
    frozen.set(category, Object.freeze([...bucket]));
  }
  return frozen;
}
