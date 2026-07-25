import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface AdherenceTrackerObservation {
  readonly id: string;
  readonly domain: "adherence";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackAdherence(
  input: GoalProgressInput,
  at: string,
): AdherenceTrackerObservation {
  const keys = uniqueSorted(input.adherenceKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("adherence"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:adherence:${input.id}`,
    domain: "adherence",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("adherence")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const AdherenceTracker = {
  observe: trackAdherence,
  metadata: EMPTY_GOAL_METADATA,
};
