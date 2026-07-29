import type { TimelineCategory } from "./TimelineCategory";
import type { TimelineEventType } from "./TimelineEventType";
import type { TimelinePeriod } from "./TimelinePeriod";
import { createTimelinePeriod } from "./TimelinePeriod";

/**
 * Immutable filter for the Coach Timeline Framework (Sprint 31.9).
 * Represent only — no search engine.
 */
export interface TimelineEventFilter {
  readonly period: TimelinePeriod;
  readonly categories: readonly TimelineCategory[];
  readonly eventTypes: readonly TimelineEventType[];
  readonly searchQuery: string | null;
  readonly includeAttachments: boolean;
}

export function createTimelineEventFilter(input: TimelineEventFilter): TimelineEventFilter {
  return Object.freeze({
    ...input,
    period: createTimelinePeriod(input.period),
    categories: Object.freeze([...input.categories]),
    eventTypes: Object.freeze([...input.eventTypes]),
  });
}

/** Sprint 31.9 presentation alias — athlete-event timeline filter. */
export type TimelineFilter = TimelineEventFilter;
export const createTimelineFilter = createTimelineEventFilter;
