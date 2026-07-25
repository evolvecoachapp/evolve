import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface HistoryTrackerObservation {
  readonly id: string;
  readonly domain: "history";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackHistory(
  input: GoalProgressInput,
  at: string,
): HistoryTrackerObservation {
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

export const HistoryTracker = {
  observe: trackHistory,
  metadata: EMPTY_GOAL_METADATA,
};
