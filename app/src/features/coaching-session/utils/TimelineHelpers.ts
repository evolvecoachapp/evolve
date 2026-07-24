import type { SessionEvent } from "../models/SessionEvent";
import type { SessionTimelineItem } from "../models/SessionTimeline";

export function sortEventsByTime(
  events: readonly SessionEvent[],
): readonly SessionEvent[] {
  return Object.freeze(
    [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
  );
}

export function toTimelineItems(
  events: readonly SessionEvent[],
): readonly SessionTimelineItem[] {
  return Object.freeze(
    sortEventsByTime(events).map((event, index) =>
      Object.freeze({
        id: `titem:${index + 1}:${event.id}`,
        event,
        ordinal: index + 1,
      }),
    ),
  );
}
