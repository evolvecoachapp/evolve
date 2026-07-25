import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface AdherenceMonitorObservation {
  readonly id: string;
  readonly domain: "adherence";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observeAdherence(
  input: AdaptationInput,
  at: string,
): AdherenceMonitorObservation {
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

export const AdherenceMonitor = {
  observe: observeAdherence,
  metadata: EMPTY_ADAPTATION_METADATA,
};
