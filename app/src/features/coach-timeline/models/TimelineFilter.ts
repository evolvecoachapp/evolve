import type { CoachTimelineDomain } from "./CoachTimelineEntry";
import type { CoachTimelineEventCategory } from "./CoachTimelineEvent";

/**
 * Immutable filter criteria for timeline queries.
 */
export interface TimelineFilter {
  readonly categories?: readonly CoachTimelineEventCategory[];
  readonly domains?: readonly CoachTimelineDomain[];
  readonly conversationId?: string | null;
  readonly lineageId?: string | null;
  readonly fromTimestamp?: string | null;
  readonly toTimestamp?: string | null;
  readonly minConfidence?: number | null;
  readonly searchText?: string | null;
}
