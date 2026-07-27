import type { CoachTimeline } from "./CoachTimeline";
import type { CoachTimelineEntry } from "./CoachTimelineEntry";
import type { CoachTimelineSummary } from "./CoachTimelineSummary";
import type { TimelineQuery } from "./TimelineQuery";

/**
 * Immutable result of a timeline query.
 */
export interface TimelineResult {
  readonly query: TimelineQuery;
  readonly timeline: CoachTimeline | null;
  readonly entries: readonly CoachTimelineEntry[];
  readonly summary: CoachTimelineSummary | null;
  readonly matchedCount: number;
  readonly success: boolean;
  readonly message: string;
}
