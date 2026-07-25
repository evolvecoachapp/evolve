import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface MilestoneTrackerObservation {
  readonly id: string;
  readonly domain: "performance";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackMilestone(
  input: GoalProgressInput,
  at: string,
): MilestoneTrackerObservation {
  const keys = uniqueSorted(input.performanceKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("performance"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:performance:${input.id}`,
    domain: "performance",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("performance")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const MilestoneTracker = {
  observe: trackMilestone,
  metadata: EMPTY_GOAL_METADATA,
};
