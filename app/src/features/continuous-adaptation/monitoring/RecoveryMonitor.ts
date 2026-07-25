import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface RecoveryMonitorObservation {
  readonly id: string;
  readonly domain: "recovery";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observeRecovery(
  input: AdaptationInput,
  at: string,
): RecoveryMonitorObservation {
  const keys = uniqueSorted(input.recoveryKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("recovery"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:recovery:${input.id}`,
    domain: "recovery",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("recovery")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const RecoveryMonitor = {
  observe: observeRecovery,
  metadata: EMPTY_ADAPTATION_METADATA,
};
