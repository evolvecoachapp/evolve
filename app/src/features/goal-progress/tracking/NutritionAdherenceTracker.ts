import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface NutritionAdherenceTrackerObservation {
  readonly id: string;
  readonly domain: "nutrition";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackNutritionAdherence(
  input: GoalProgressInput,
  at: string,
): NutritionAdherenceTrackerObservation {
  const keys = uniqueSorted(input.nutritionKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("nutrition"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:nutrition:${input.id}`,
    domain: "nutrition",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("nutrition")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const NutritionAdherenceTracker = {
  observe: trackNutritionAdherence,
  metadata: EMPTY_GOAL_METADATA,
};
