import type { CoachTimelineSummaryKind } from "./CoachTimelineSummary";
import type { CoachTimelineJournalFilter } from "./CoachTimelineJournalFilter";

/**
 * Immutable query against the Coach Timeline Decision Journal.
 */
export interface TimelineQuery {
  readonly athleteId: string;
  readonly filter?: CoachTimelineJournalFilter | null;
  readonly summaryKind?: CoachTimelineSummaryKind | null;
  readonly limit?: number | null;
  readonly order?: "asc" | "desc";
}
