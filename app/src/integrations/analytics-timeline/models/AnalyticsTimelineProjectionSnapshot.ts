import type { AnalyticsTimelineSource } from "../events";

/** Snapshot of projector state for diagnostics and tests. */
export interface AnalyticsTimelineProjectionSnapshot {
  readonly projectedEventCount: number;
  readonly lastEventId: string | null;
  readonly lastEventType: string | null;
  readonly lastSource: AnalyticsTimelineSource | null;
  readonly capturedAt: string;
}

export function createAnalyticsTimelineProjectionSnapshot(
  input: AnalyticsTimelineProjectionSnapshot,
): AnalyticsTimelineProjectionSnapshot {
  return Object.freeze({ ...input });
}
