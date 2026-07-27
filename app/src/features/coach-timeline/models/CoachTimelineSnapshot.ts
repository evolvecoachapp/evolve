import type { CoachTimeline } from "./CoachTimeline";
import type { CoachTimelineSummary } from "./CoachTimelineSummary";

/**
 * Immutable frozen view of a timeline at a point in time.
 */
export interface CoachTimelineSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly timeline: CoachTimeline;
  readonly summary: CoachTimelineSummary | null;
  readonly capturedAt: string;
}
