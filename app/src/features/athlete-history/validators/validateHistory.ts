import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { HistoryEntry } from "../models/HistoryEntry";
import { validateCategories } from "./validateCategories";
import {
  validateChronologicalOrder,
  validateTimestamps,
} from "./validateChronology";
import { validateDuplicates } from "./validateDuplicates";
import { validateReferences } from "./validateReferences";

/**
 * Soft-validate build inputs for cross-entity alignment.
 */
export function validateBuildInput(
  workoutResult?: WorkoutResult | null,
  performanceSnapshot?: PerformanceSnapshot | null,
  achievementResult?: AchievementResult | null,
): readonly string[] {
  const issues: string[] = [];

  if (
    workoutResult &&
    performanceSnapshot &&
    workoutResult.runtimeId !== performanceSnapshot.session.runtimeId
  ) {
    issues.push("workout_performance_runtime_mismatch");
  }
  if (
    workoutResult &&
    performanceSnapshot &&
    workoutResult.sessionId !== performanceSnapshot.session.sessionId
  ) {
    issues.push("workout_performance_session_mismatch");
  }
  if (
    performanceSnapshot &&
    achievementResult &&
    performanceSnapshot.id !== achievementResult.performanceSnapshotId
  ) {
    issues.push("performance_achievement_snapshot_mismatch");
  }
  if (
    workoutResult &&
    achievementResult &&
    workoutResult.runtimeId !== achievementResult.runtimeId
  ) {
    issues.push("workout_achievement_runtime_mismatch");
  }
  if (
    workoutResult &&
    achievementResult &&
    workoutResult.sessionId !== achievementResult.sessionId
  ) {
    issues.push("workout_achievement_session_mismatch");
  }

  return Object.freeze(issues);
}

/**
 * Run all entry validators; returns soft issues (non-throwing).
 */
export function validateHistoryEntries(
  entries: readonly HistoryEntry[],
): readonly string[] {
  return Object.freeze([
    ...new Set([
      ...validateDuplicates(entries),
      ...validateChronologicalOrder(entries),
      ...validateTimestamps(entries),
      ...validateReferences(entries),
      ...validateCategories(entries),
    ]),
  ]);
}
