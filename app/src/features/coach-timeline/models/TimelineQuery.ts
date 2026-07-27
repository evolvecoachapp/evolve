import type { CoachTimelineSummaryKind } from "./CoachTimelineSummary";
import type { TimelineFilter } from "./TimelineFilter";

/**
 * Immutable query against the Coach Timeline.
 */
export interface TimelineQuery {
  readonly athleteId: string;
  readonly filter?: TimelineFilter | null;
  readonly summaryKind?: CoachTimelineSummaryKind | null;
  readonly limit?: number | null;
  readonly order?: "asc" | "desc";
}
