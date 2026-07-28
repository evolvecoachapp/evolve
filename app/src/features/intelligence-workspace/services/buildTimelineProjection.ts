import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { WorkspaceTimeline } from "../models/WorkspaceTimeline";

export interface BuildTimelineProjectionInput {
  readonly athleteId: string;
  readonly timeline?: CoachTimeline | null;
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
  readonly planHistory?: PlanHistory | null;
}

/**
 * Builds timeline projection from Coach Timeline and plan history state.
 */
export function buildTimelineProjection(
  input: BuildTimelineProjectionInput,
): WorkspaceTimeline {
  const entries = input.timeline?.entries ?? Object.freeze([]);
  const latestPlanChangeAt =
    entries.length > 0 ? entries[entries.length - 1]?.timestamp ?? null : null;

  return Object.freeze({
    athleteId: input.athleteId,
    present: input.timeline != null,
    timeline: input.timeline ?? null,
    latestDecisions: input.latestDecisions ?? Object.freeze([]),
    latestRestores: input.latestRestores ?? Object.freeze([]),
    historyVersionCount: input.planHistory?.currentVersionNumber ?? 0,
    latestPlanChangeAt,
  });
}
