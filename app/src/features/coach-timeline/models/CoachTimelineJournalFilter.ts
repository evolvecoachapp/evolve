import type { CoachTimelineDomain } from "./CoachTimelineEntry";
import type { CoachTimelineEventCategory } from "./CoachTimelineEvent";

/**
 * Immutable filter criteria for Decision Journal timeline queries (ADR-086).
 * Distinct from the Sprint 31.9 athlete-event TimelineFilter presentation model.
 */
export interface CoachTimelineJournalFilter {
  readonly categories?: readonly CoachTimelineEventCategory[];
  readonly domains?: readonly CoachTimelineDomain[];
  readonly conversationId?: string | null;
  readonly lineageId?: string | null;
  readonly fromTimestamp?: string | null;
  readonly toTimestamp?: string | null;
  readonly minConfidence?: number | null;
  readonly searchText?: string | null;
}
