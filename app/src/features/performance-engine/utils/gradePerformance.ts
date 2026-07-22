import type { PerformanceGrade } from "../models/PerformanceGrade";
import type { PerformanceMetrics } from "../models/PerformanceMetrics";
import type { PerformanceSnapshot } from "../models/PerformanceSnapshot";

/**
 * Grade single-session performance from completion + volume heuristics.
 * Not AI. Not multi-session ranking. Not personal records.
 */
export function gradeFromMetrics(
  metrics: PerformanceMetrics,
  finalState: "Completed" | "Cancelled",
): PerformanceGrade {
  if (finalState === "Cancelled") {
    return "Incomplete";
  }

  const completion = metrics.completion.workoutCompletionPercent;
  const hasWork =
    metrics.volume.totalCompletedSets > 0 ||
    metrics.volume.totalCompletedRepetitions > 0;

  if (!hasWork && completion < 100) {
    return "Incomplete";
  }

  if (completion >= 90) {
    return "A";
  }
  if (completion >= 75) {
    return "B";
  }
  if (completion >= 50) {
    return "C";
  }
  if (completion >= 25) {
    return "D";
  }
  return "F";
}

export function gradeSnapshot(
  snapshot: PerformanceSnapshot,
): PerformanceGrade {
  return snapshot.grade;
}
