import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface GoalTrackerObservation {
  readonly id: string;
  readonly domain: "goal";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackGoal(
  input: GoalProgressInput,
  at: string,
): GoalTrackerObservation {
  const keys = uniqueSorted(input.goalKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("goal"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:goal:${input.id}`,
    domain: "goal",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("goal")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const GoalTracker = {
  observe: trackGoal,
  metadata: EMPTY_GOAL_METADATA,
};
