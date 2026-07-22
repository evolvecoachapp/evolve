import type { PerformanceMetrics } from "../models/PerformanceMetrics";

/**
 * Validate metric consistency and reject negative / NaN values.
 */
export function validateMetricConsistency(
  metrics: PerformanceMetrics,
): readonly string[] {
  const issues: string[] = [];

  const checkNonNegative = (label: string, value: number): void => {
    if (Number.isNaN(value)) {
      issues.push(`nan_value:${label}`);
    } else if (value < 0) {
      issues.push(`negative_value:${label}`);
    }
  };

  checkNonNegative("tonnage", metrics.volume.tonnage);
  checkNonNegative("volumeLoad", metrics.volume.volumeLoad);
  checkNonNegative(
    "totalCompletedSets",
    metrics.volume.totalCompletedSets,
  );
  checkNonNegative(
    "totalCompletedRepetitions",
    metrics.volume.totalCompletedRepetitions,
  );
  checkNonNegative("durationMs", metrics.density.durationMs);
  checkNonNegative("totalExercises", metrics.completion.totalExercises);
  checkNonNegative(
    "completedExercises",
    metrics.completion.completedExercises,
  );
  checkNonNegative("totalSets", metrics.completion.totalSets);
  checkNonNegative("completedSets", metrics.completion.completedSets);

  if (
    metrics.completion.completedExercises > metrics.completion.totalExercises
  ) {
    issues.push("completed_exercises_exceed_total");
  }
  if (metrics.completion.completedSets > metrics.completion.totalSets) {
    issues.push("completed_sets_exceed_total");
  }

  const optional = [
    ["averageWeight", metrics.intensity.averageWeight],
    ["averageRepetitions", metrics.intensity.averageRepetitions],
    ["averageRpe", metrics.intensity.averageRpe],
    ["averageRir", metrics.intensity.averageRir],
    ["tonnagePerMinute", metrics.density.tonnagePerMinute],
    ["setsPerMinute", metrics.density.setsPerMinute],
    ["repetitionsPerMinute", metrics.density.repetitionsPerMinute],
  ] as const;

  for (const [label, value] of optional) {
    if (value === null) {
      continue;
    }
    if (Number.isNaN(value)) {
      issues.push(`nan_value:${label}`);
    } else if (value < 0) {
      issues.push(`negative_value:${label}`);
    }
  }

  return Object.freeze(issues);
}
