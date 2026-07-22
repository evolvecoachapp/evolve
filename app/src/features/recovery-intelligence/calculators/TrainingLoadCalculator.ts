import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { TrainingLoad } from "../models/TrainingLoad";
import {
  performanceEntriesInWindow,
  sumTonnage,
} from "../utils/aggregateMetrics";
import { clamp, normalizeNonNegative, roundTo } from "../utils/normalizeValues";

/**
 * Pure training-load calculator from Performance Snapshot + Athlete History.
 * One responsibility: session + cumulative load metrics.
 */
export class TrainingLoadCalculator {
  calculate(input: {
    readonly performanceSnapshot: PerformanceSnapshot;
    readonly athleteHistory: AthleteHistory;
    readonly analyzedAt: string;
    readonly frequencyWindowDays: number;
  }): TrainingLoad {
    const volume = input.performanceSnapshot.metrics.volume;
    const sessionLoad = normalizeNonNegative(volume.tonnage);
    const volumeLoad = normalizeNonNegative(volume.volumeLoad);
    const completedSets = normalizeNonNegative(volume.totalCompletedSets);
    const completedRepetitions = normalizeNonNegative(
      volume.totalCompletedRepetitions,
    );

    const historySamples = performanceEntriesInWindow(
      input.athleteHistory,
      input.analyzedAt,
      input.frequencyWindowDays,
    );
    const cumulativeTonnage = sumTonnage(historySamples);

    const averageSessionLoad =
      historySamples.length > 0
        ? roundTo(cumulativeTonnage / historySamples.length, 4)
        : null;

    const relativeLoad =
      averageSessionLoad !== null && averageSessionLoad > 0
        ? roundTo(sessionLoad / averageSessionLoad, 4)
        : null;

    // 5000 tonnage → 100; linear, clamped.
    const loadScore = clamp(roundTo(sessionLoad / 50, 4), 0, 100);

    return Object.freeze({
      sessionLoad,
      volumeLoad,
      completedSets,
      completedRepetitions,
      cumulativeTonnage,
      averageSessionLoad,
      relativeLoad,
      loadScore,
    });
  }
}

export function createTrainingLoadCalculator(): TrainingLoadCalculator {
  return new TrainingLoadCalculator();
}
