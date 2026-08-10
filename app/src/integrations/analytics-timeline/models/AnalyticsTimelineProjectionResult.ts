import type { CoachTimelineEntry } from "../../../features/coach-timeline/models/CoachTimelineEntry";

/** Result returned when an analytics event is projected into Coach Timeline. */
export interface AnalyticsTimelineProjectionResult {
  readonly eventId: string;
  readonly accepted: boolean;
  readonly projectedAt: string;
  readonly timelineEntryId: string | null;
  readonly entry: CoachTimelineEntry | null;
}

export function createAnalyticsTimelineProjectionResult(
  input: AnalyticsTimelineProjectionResult,
): AnalyticsTimelineProjectionResult {
  return Object.freeze({ ...input });
}
