import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface HistoryMonitorObservation {
  readonly id: string;
  readonly domain: "history";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observeHistory(
  input: AdaptationInput,
  at: string,
): HistoryMonitorObservation {
  const keys = uniqueSorted(input.historyKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("history"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:history:${input.id}`,
    domain: "history",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("history")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const HistoryMonitor = {
  observe: observeHistory,
  metadata: EMPTY_ADAPTATION_METADATA,
};
