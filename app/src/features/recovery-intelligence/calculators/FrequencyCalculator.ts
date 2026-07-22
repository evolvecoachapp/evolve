import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { FrequencyLoad } from "../models/FrequencyLoad";
import {
  countWorkoutsInWindow,
  performanceEntriesInWindow,
} from "../utils/aggregateMetrics";
import { clamp, roundTo } from "../utils/normalizeValues";

/**
 * Pure frequency calculator from Athlete History workout density.
 * One responsibility: history window → frequency load.
 */
export class FrequencyCalculator {
  calculate(input: {
    readonly athleteHistory: AthleteHistory;
    readonly analyzedAt: string;
    readonly frequencyWindowDays: number;
  }): FrequencyLoad {
    const windowDays = Math.max(1, Math.floor(input.frequencyWindowDays));
    const workoutsInWindow = countWorkoutsInWindow(
      input.athleteHistory,
      input.analyzedAt,
      windowDays,
    );
    const performanceEntriesInWindowCount = performanceEntriesInWindow(
      input.athleteHistory,
      input.analyzedAt,
      windowDays,
    ).length;

    // 7 workouts in window → 100; linear, clamped.
    const frequencyScore = clamp(roundTo(workoutsInWindow * (100 / 7), 4), 0, 100);

    return Object.freeze({
      windowDays,
      workoutsInWindow,
      performanceEntriesInWindow: performanceEntriesInWindowCount,
      frequencyScore,
    });
  }
}

export function createFrequencyCalculator(): FrequencyCalculator {
  return new FrequencyCalculator();
}
