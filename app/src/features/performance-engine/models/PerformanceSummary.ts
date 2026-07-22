import type { PerformanceGrade } from "./PerformanceGrade";

/**
 * Compact public summary of a performance analysis.
 */
export interface PerformanceSummary {
  readonly snapshotId: string;
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly grade: PerformanceGrade;
  readonly workoutCompletionPercent: number;
  readonly tonnage: number;
  readonly totalCompletedSets: number;
  readonly totalCompletedRepetitions: number;
  readonly durationMs: number;
  readonly summaryText: string;
}
