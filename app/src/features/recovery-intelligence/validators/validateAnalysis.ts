import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import { validateMetricConsistency } from "./validateMetricConsistency";
import { validateRecoveryWindow } from "./validateRecoveryWindow";

/**
 * Soft-validate analysis inputs for cross-entity alignment.
 */
export function validateAnalysisInput(
  athleteHistory: AthleteHistory,
  performanceSnapshot: PerformanceSnapshot,
  workoutResult?: WorkoutResult | null,
  achievementResult?: AchievementResult | null,
): readonly string[] {
  const issues: string[] = [];

  if (!athleteHistory.id) {
    issues.push("history_missing_id");
  }
  if (!performanceSnapshot.id) {
    issues.push("performance_snapshot_missing_id");
  }

  if (
    workoutResult &&
    workoutResult.runtimeId !== performanceSnapshot.session.runtimeId
  ) {
    issues.push("workout_performance_runtime_mismatch");
  }
  if (
    workoutResult &&
    workoutResult.sessionId !== performanceSnapshot.session.sessionId
  ) {
    issues.push("workout_performance_session_mismatch");
  }
  if (
    achievementResult &&
    achievementResult.performanceSnapshotId !== performanceSnapshot.id
  ) {
    issues.push("performance_achievement_snapshot_mismatch");
  }
  if (
    athleteHistory.context.performanceSnapshotId &&
    athleteHistory.context.performanceSnapshotId !== performanceSnapshot.id
  ) {
    issues.push("history_performance_snapshot_mismatch");
  }

  return Object.freeze(issues);
}

/**
 * Soft-validate computed metrics.
 */
export function validateComputedMetrics(
  metrics: RecoveryMetrics,
): readonly string[] {
  return Object.freeze([
    ...new Set([
      ...validateMetricConsistency(metrics),
      ...validateRecoveryWindow(metrics.recoveryWindow),
    ]),
  ]);
}
