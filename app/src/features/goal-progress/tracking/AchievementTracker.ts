import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/GoalHelpers";

export interface AchievementTrackerObservation {
  readonly id: string;
  readonly domain: "recovery";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function trackAchievement(
  input: GoalProgressInput,
  at: string,
): AchievementTrackerObservation {
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

export const AchievementTracker = {
  observe: trackAchievement,
  metadata: EMPTY_GOAL_METADATA,
};
