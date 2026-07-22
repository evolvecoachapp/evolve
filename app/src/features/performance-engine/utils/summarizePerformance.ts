import type { PerformanceGrade } from "../models/PerformanceGrade";
import type { PerformanceMetrics } from "../models/PerformanceMetrics";
import type { PerformanceSnapshot } from "../models/PerformanceSnapshot";
import type { PerformanceSummary } from "../models/PerformanceSummary";

/**
 * Format duration milliseconds as a short human string.
 */
export function formatDurationMs(durationMs: number): string {
  if (durationMs <= 0) {
    return "0s";
  }
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Format tonnage with fixed precision.
 */
export function formatTonnage(tonnage: number): string {
  if (Number.isInteger(tonnage)) {
    return String(tonnage);
  }
  return tonnage.toFixed(1);
}

/**
 * Build a one-line summary text for a performance snapshot.
 */
export function buildSummaryText(input: {
  readonly grade: PerformanceGrade;
  readonly workoutCompletionPercent: number;
  readonly tonnage: number;
  readonly totalCompletedSets: number;
  readonly durationMs: number;
}): string {
  return [
    `Grade ${input.grade}`,
    `${Math.round(input.workoutCompletionPercent)}% complete`,
    `${input.totalCompletedSets} sets`,
    `${formatTonnage(input.tonnage)} tonnage`,
    formatDurationMs(input.durationMs),
  ].join(" · ");
}

/**
 * Summarize metrics into a compact PerformanceSummary shape (without id fields).
 */
export function summarizeMetrics(
  metrics: PerformanceMetrics,
  grade: PerformanceGrade,
): {
  readonly workoutCompletionPercent: number;
  readonly tonnage: number;
  readonly totalCompletedSets: number;
  readonly totalCompletedRepetitions: number;
  readonly durationMs: number;
  readonly grade: PerformanceGrade;
  readonly summaryText: string;
} {
  return Object.freeze({
    grade,
    workoutCompletionPercent: metrics.completion.workoutCompletionPercent,
    tonnage: metrics.volume.tonnage,
    totalCompletedSets: metrics.volume.totalCompletedSets,
    totalCompletedRepetitions: metrics.volume.totalCompletedRepetitions,
    durationMs: metrics.density.durationMs,
    summaryText: buildSummaryText({
      grade,
      workoutCompletionPercent: metrics.completion.workoutCompletionPercent,
      tonnage: metrics.volume.tonnage,
      totalCompletedSets: metrics.volume.totalCompletedSets,
      durationMs: metrics.density.durationMs,
    }),
  });
}

/**
 * Extract public summary from a frozen snapshot.
 */
export function summarizeSnapshot(
  snapshot: PerformanceSnapshot,
): PerformanceSummary {
  return Object.freeze({ ...snapshot.summary });
}
