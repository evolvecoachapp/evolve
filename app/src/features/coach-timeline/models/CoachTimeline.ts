import type { CoachTimelineEntry } from "./CoachTimelineEntry";

/**
 * Immutable chronological reasoning history for an athlete.
 * Append-only decision journal — not chat history, not analytics.
 */
export interface CoachTimeline {
  readonly athleteId: string;
  readonly entries: readonly CoachTimelineEntry[];
  readonly entryCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
