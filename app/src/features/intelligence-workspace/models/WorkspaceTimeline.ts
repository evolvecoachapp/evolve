import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";

/**
 * Timeline projection for dashboard consumers.
 */
export interface WorkspaceTimeline {
  readonly athleteId: string;
  readonly present: boolean;
  readonly timeline: CoachTimeline | null;
  readonly latestDecisions: readonly CoachTimelineEntry[];
  readonly latestRestores: readonly CoachTimelineEntry[];
  readonly historyVersionCount: number;
  readonly latestPlanChangeAt: string | null;
}
