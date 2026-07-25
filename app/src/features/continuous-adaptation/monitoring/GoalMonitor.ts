import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface GoalMonitorObservation {
  readonly id: string;
  readonly domain: "goal";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observeGoal(
  input: AdaptationInput,
  at: string,
): GoalMonitorObservation {
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

export const GoalMonitor = {
  observe: observeGoal,
  metadata: EMPTY_ADAPTATION_METADATA,
};
