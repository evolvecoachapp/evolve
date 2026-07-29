import type { TimelineEvent } from "./TimelineEvent";
import { createTimelineEvent } from "./TimelineEvent";
import type { TimelineEventFilter } from "./TimelineEventFilter";
import { createTimelineEventFilter } from "./TimelineEventFilter";
import type { TimelineGroup } from "./TimelineGroup";
import { createTimelineGroup } from "./TimelineGroup";
import type { TimelinePagination } from "./TimelinePagination";
import { createTimelinePagination } from "./TimelinePagination";
import type { TimelinePeriod } from "./TimelinePeriod";
import { createTimelinePeriod } from "./TimelinePeriod";
import type { TimelineSection } from "./TimelineSection";
import { createTimelineSection } from "./TimelineSection";
import type { TimelineSnapshot } from "./TimelineSnapshot";
import type { TimelineStatistics } from "./TimelineStatistics";
import { createTimelineStatistics } from "./TimelineStatistics";

/**
 * Aggregate immutable read model for the Coach Timeline Framework (Sprint 31.9).
 */
export interface AthleteTimeline {
  readonly period: TimelinePeriod;
  readonly filter: TimelineEventFilter;
  readonly events: readonly TimelineEvent[];
  readonly groups: readonly TimelineGroup[];
  readonly sections: readonly TimelineSection[];
  readonly statistics: TimelineStatistics;
  readonly pagination: TimelinePagination;
  readonly searchQuery: string | null;
  readonly snapshot: TimelineSnapshot | null;
}

export function createAthleteTimeline(input: AthleteTimeline): AthleteTimeline {
  return Object.freeze({
    ...input,
    period: createTimelinePeriod(input.period),
    filter: createTimelineEventFilter(input.filter),
    events: Object.freeze(input.events.map(createTimelineEvent)),
    groups: Object.freeze(input.groups.map(createTimelineGroup)),
    sections: Object.freeze(input.sections.map(createTimelineSection)),
    statistics: createTimelineStatistics(input.statistics),
    pagination: createTimelinePagination(input.pagination),
  });
}
