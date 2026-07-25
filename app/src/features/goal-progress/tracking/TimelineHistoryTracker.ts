import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface TimelineHistoryTrackerObservation {
  readonly id: string;
  readonly domain: "timeline";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackTimelineHistory(
  input: GoalProgressInput,
  at: string,
): TimelineHistoryTrackerObservation {
  const keys = uniqueSorted(input.timelineKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("timeline"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:timeline:${input.id}`,
    domain: "timeline",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("timeline")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const TimelineHistoryTracker = {
  observe: trackTimelineHistory,
  metadata: EMPTY_GOAL_METADATA,
};
