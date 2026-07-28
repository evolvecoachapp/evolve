import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";

/**
 * Immutable timeline projection from Coach Timeline.
 */
export interface WorkspaceTimeline {
  readonly athleteId: string;
  readonly present: boolean;
  readonly timeline: CoachTimeline | null;
  readonly latestEvents: readonly CoachTimelineEntry[];
  readonly latestDecisions: readonly CoachTimelineEntry[];
  readonly latestRestores: readonly CoachTimelineEntry[];
  readonly entryCount: number;
  readonly latestEventAt: string | null;
}
