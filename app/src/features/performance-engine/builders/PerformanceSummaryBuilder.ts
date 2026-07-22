import type { PerformanceGrade } from "../models/PerformanceGrade";
import type { PerformanceSummary } from "../models/PerformanceSummary";
import { buildSummaryText } from "../utils/summarizePerformance";
import { freezeSummary } from "../utils/freezeSnapshots";

/**
 * Fluent builder for immutable PerformanceSummary.
 */
export class PerformanceSummaryBuilder {
  private snapshotId = "";
  private sessionId = "";
  private runtimeId = "";
  private grade: PerformanceGrade = "Incomplete";
  private workoutCompletionPercent = 0;
  private tonnage = 0;
  private totalCompletedSets = 0;
  private totalCompletedRepetitions = 0;
  private durationMs = 0;
  private summaryText: string | null = null;

  withIds(input: {
    readonly snapshotId: string;
    readonly sessionId: string;
    readonly runtimeId: string;
  }): this {
    this.snapshotId = input.snapshotId;
    this.sessionId = input.sessionId;
    this.runtimeId = input.runtimeId;
    return this;
  }

  withGrade(grade: PerformanceGrade): this {
    this.grade = grade;
    return this;
  }

  withMetrics(input: {
    readonly workoutCompletionPercent: number;
    readonly tonnage: number;
    readonly totalCompletedSets: number;
    readonly totalCompletedRepetitions: number;
    readonly durationMs: number;
  }): this {
    this.workoutCompletionPercent = input.workoutCompletionPercent;
    this.tonnage = input.tonnage;
    this.totalCompletedSets = input.totalCompletedSets;
    this.totalCompletedRepetitions = input.totalCompletedRepetitions;
    this.durationMs = input.durationMs;
    return this;
  }

  withSummaryText(text: string): this {
    this.summaryText = text;
    return this;
  }

  build(): PerformanceSummary {
    const summaryText =
      this.summaryText ??
      buildSummaryText({
        grade: this.grade,
        workoutCompletionPercent: this.workoutCompletionPercent,
        tonnage: this.tonnage,
        totalCompletedSets: this.totalCompletedSets,
        durationMs: this.durationMs,
      });

    return freezeSummary({
      snapshotId: this.snapshotId,
      sessionId: this.sessionId,
      runtimeId: this.runtimeId,
      grade: this.grade,
      workoutCompletionPercent: this.workoutCompletionPercent,
      tonnage: this.tonnage,
      totalCompletedSets: this.totalCompletedSets,
      totalCompletedRepetitions: this.totalCompletedRepetitions,
      durationMs: this.durationMs,
      summaryText,
    });
  }
}
