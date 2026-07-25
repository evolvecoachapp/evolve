import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface ConsistencyTrackerObservation {
  readonly id: string;
  readonly domain: "state";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackConsistency(
  input: GoalProgressInput,
  at: string,
): ConsistencyTrackerObservation {
  const keys = uniqueSorted(input.stateKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("state"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:state:${input.id}`,
    domain: "state",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("state")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const ConsistencyTracker = {
  observe: trackConsistency,
  metadata: EMPTY_GOAL_METADATA,
};
