import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface PerformanceMonitorObservation {
  readonly id: string;
  readonly domain: "performance";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observePerformance(
  input: AdaptationInput,
  at: string,
): PerformanceMonitorObservation {
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

export const PerformanceMonitor = {
  observe: observePerformance,
  metadata: EMPTY_ADAPTATION_METADATA,
};
