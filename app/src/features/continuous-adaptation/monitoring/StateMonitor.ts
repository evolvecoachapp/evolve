import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface StateMonitorObservation {
  readonly id: string;
  readonly domain: "state";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observeState(
  input: AdaptationInput,
  at: string,
): StateMonitorObservation {
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

export const StateMonitor = {
  observe: observeState,
  metadata: EMPTY_ADAPTATION_METADATA,
};
