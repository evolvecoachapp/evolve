import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface NutritionMonitorObservation {
  readonly id: string;
  readonly domain: "nutrition";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observeNutrition(
  input: AdaptationInput,
  at: string,
): NutritionMonitorObservation {
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

export const NutritionMonitor = {
  observe: observeNutrition,
  metadata: EMPTY_ADAPTATION_METADATA,
};
