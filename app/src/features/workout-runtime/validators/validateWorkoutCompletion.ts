import type { WorkoutRuntime } from "../models/WorkoutRuntime";
import { isTerminalWorkoutState } from "../models/WorkoutState";

/**
 * Validate whether a workout can be marked completed.
 */
export function validateWorkoutCompletion(
  runtime: WorkoutRuntime,
): readonly string[] {
  const issues: string[] = [];

  if (isTerminalWorkoutState(runtime.state)) {
    issues.push(`already_terminal:${runtime.state}`);
  }

  if (runtime.state !== "Running" && runtime.state !== "Paused") {
    if (runtime.state === "NotStarted") {
      issues.push("cannot_complete_not_started");
    }
  }

  const unfinished = runtime.exercises.filter(
    (exercise) =>
      exercise.state !== "Completed" && exercise.state !== "Skipped",
  );

  if (unfinished.length > 0) {
    issues.push(
      `unfinished_exercises:${unfinished.map((item) => item.id).join(",")}`,
    );
  }

  return Object.freeze(issues);
}

/**
 * Soft completion check used when auto-completing after last set/skip.
 * Allows completion from Running even if paused flag is absent.
 */
export function canAutoCompleteWorkout(runtime: WorkoutRuntime): boolean {
  if (runtime.state !== "Running") {
    return false;
  }
  return runtime.exercises.every(
    (exercise) =>
      exercise.state === "Completed" || exercise.state === "Skipped",
  );
}
