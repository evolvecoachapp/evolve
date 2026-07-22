import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import {
  checkNonNegative,
  checkOptionalNonNegative,
} from "./validateNegativeValues";

/**
 * Validate metric consistency and reject negative / NaN values.
 */
export function validateMetricConsistency(
  metrics: RecoveryMetrics,
): readonly string[] {
  const issues: string[] = [];

  checkNonNegative("sessionLoad", metrics.trainingLoad.sessionLoad, issues);
  checkNonNegative("volumeLoad", metrics.trainingLoad.volumeLoad, issues);
  checkNonNegative("completedSets", metrics.trainingLoad.completedSets, issues);
  checkNonNegative(
    "completedRepetitions",
    metrics.trainingLoad.completedRepetitions,
    issues,
  );
  checkNonNegative(
    "cumulativeTonnage",
    metrics.trainingLoad.cumulativeTonnage,
    issues,
  );
  checkOptionalNonNegative(
    "averageSessionLoad",
    metrics.trainingLoad.averageSessionLoad,
    issues,
  );
  checkOptionalNonNegative(
    "relativeLoad",
    metrics.trainingLoad.relativeLoad,
    issues,
  );
  checkNonNegative("loadScore", metrics.trainingLoad.loadScore, issues);

  checkNonNegative("fatigueScore", metrics.fatigue.score, issues);
  checkNonNegative("loadComponent", metrics.fatigue.loadComponent, issues);
  checkNonNegative(
    "densityComponent",
    metrics.fatigue.densityComponent,
    issues,
  );
  checkNonNegative(
    "frequencyComponent",
    metrics.fatigue.frequencyComponent,
    issues,
  );

  checkNonNegative("durationMs", metrics.densityLoad.durationMs, issues);
  checkNonNegative(
    "durationMinutes",
    metrics.densityLoad.durationMinutes,
    issues,
  );
  checkOptionalNonNegative(
    "tonnagePerMinute",
    metrics.densityLoad.tonnagePerMinute,
    issues,
  );
  checkOptionalNonNegative(
    "setsPerMinute",
    metrics.densityLoad.setsPerMinute,
    issues,
  );
  checkOptionalNonNegative(
    "repetitionsPerMinute",
    metrics.densityLoad.repetitionsPerMinute,
    issues,
  );
  checkNonNegative("densityScore", metrics.densityLoad.densityScore, issues);

  checkNonNegative("windowDays", metrics.frequencyLoad.windowDays, issues);
  checkNonNegative(
    "workoutsInWindow",
    metrics.frequencyLoad.workoutsInWindow,
    issues,
  );
  checkNonNegative(
    "performanceEntriesInWindow",
    metrics.frequencyLoad.performanceEntriesInWindow,
    issues,
  );
  checkNonNegative(
    "frequencyScore",
    metrics.frequencyLoad.frequencyScore,
    issues,
  );

  if (metrics.trainingLoad.loadScore > 100) {
    issues.push("load_score_exceeds_100");
  }
  if (metrics.fatigue.score > 100) {
    issues.push("fatigue_score_exceeds_100");
  }
  if (metrics.densityLoad.densityScore > 100) {
    issues.push("density_score_exceeds_100");
  }
  if (metrics.frequencyLoad.frequencyScore > 100) {
    issues.push("frequency_score_exceeds_100");
  }

  return Object.freeze(issues);
}
