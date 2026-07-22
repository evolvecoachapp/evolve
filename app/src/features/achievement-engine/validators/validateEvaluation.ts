import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { Achievement } from "../models/Achievement";
import { validateAchievementIntegrity } from "./validateAchievementIntegrity";
import { validateDuplicates } from "./validateDuplicates";
import { validateEvidenceConsistency } from "./validateEvidence";
import { validateAchievementMetadata } from "./validateMetadata";
import { validateRuleConsistency } from "./validateRuleConsistency";

/**
 * Soft-validate evaluation inputs (snapshot + workout result alignment).
 */
export function validateEvaluationInput(
  performanceSnapshot: PerformanceSnapshot,
  workoutResult: WorkoutResult,
): readonly string[] {
  const issues: string[] = [];

  if (!performanceSnapshot?.id) {
    issues.push("missing_performance_snapshot");
  }
  if (!workoutResult?.runtimeId) {
    issues.push("missing_workout_result");
  }
  if (
    performanceSnapshot &&
    workoutResult &&
    performanceSnapshot.session.runtimeId !== workoutResult.runtimeId
  ) {
    issues.push("snapshot_runtime_mismatch");
  }
  if (
    performanceSnapshot &&
    workoutResult &&
    performanceSnapshot.session.sessionId !== workoutResult.sessionId
  ) {
    issues.push("snapshot_session_mismatch");
  }
  if (
    workoutResult &&
    workoutResult.finalState !== "Completed" &&
    workoutResult.finalState !== "Cancelled"
  ) {
    issues.push("workout_result_not_terminal");
  }

  return Object.freeze(issues);
}

/**
 * Run all achievement validators; returns soft issues (non-throwing).
 */
export function validateAchievements(
  achievements: readonly Achievement[],
): readonly string[] {
  const issues: string[] = [...validateDuplicates(achievements)];

  for (const achievement of achievements) {
    issues.push(...validateAchievementIntegrity(achievement));
    issues.push(...validateEvidenceConsistency(achievement));
    issues.push(...validateRuleConsistency(achievement));
    issues.push(...validateAchievementMetadata(achievement));
  }

  return Object.freeze([...new Set(issues)]);
}
