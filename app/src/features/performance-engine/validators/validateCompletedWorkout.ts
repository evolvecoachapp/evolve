import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";

/**
 * Validate that a workout result is eligible for performance analysis.
 * Completed workouts are required for full analysis; cancelled yields soft issues.
 */
export function validateCompletedWorkout(
  result: WorkoutResult,
): readonly string[] {
  const issues: string[] = [];

  if (!result.runtimeId) {
    issues.push("missing_runtime_id");
  }
  if (!result.sessionId) {
    issues.push("missing_session_id");
  }
  if (result.finalState !== "Completed" && result.finalState !== "Cancelled") {
    issues.push(`invalid_final_state:${String(result.finalState)}`);
  }
  if (result.finalState !== "Completed") {
    issues.push("workout_not_completed");
  }
  if (!result.progress) {
    issues.push("missing_progress");
  }
  if (!result.metrics) {
    issues.push("missing_metrics");
  }

  return Object.freeze(issues);
}
