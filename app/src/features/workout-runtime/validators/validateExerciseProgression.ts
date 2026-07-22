import type { WorkoutRuntime } from "../models/WorkoutRuntime";
import { getCurrentExercise } from "./validateSetProgression";

/**
 * Validate exercise skip / advance operations.
 */
export function validateExerciseProgression(
  runtime: WorkoutRuntime,
): readonly string[] {
  const issues: string[] = [];

  if (runtime.state !== "Running") {
    issues.push(`exercise_progression_requires_running:${runtime.state}`);
  }

  const exercise = getCurrentExercise(runtime);
  if (!exercise) {
    issues.push("no_current_exercise");
    return Object.freeze(issues);
  }

  if (exercise.state !== "Active") {
    issues.push(`exercise_not_active:${exercise.id}:${exercise.state}`);
  }

  if (exercise.skipped) {
    issues.push(`exercise_already_skipped:${exercise.id}`);
  }

  if (exercise.completed) {
    issues.push(`exercise_already_completed:${exercise.id}`);
  }

  return Object.freeze(issues);
}

/**
 * Validate advancing to the next exercise after the current one is done/skipped.
 */
export function validateAdvanceExercise(
  runtime: WorkoutRuntime,
): readonly string[] {
  const issues: string[] = [];
  const exercise = getCurrentExercise(runtime);

  if (!exercise) {
    issues.push("no_current_exercise");
    return Object.freeze(issues);
  }

  if (exercise.state !== "Completed" && exercise.state !== "Skipped") {
    issues.push(`exercise_not_finished:${exercise.id}:${exercise.state}`);
  }

  const nextIndex =
    runtime.currentExerciseIndex === null
      ? -1
      : runtime.currentExerciseIndex + 1;

  if (nextIndex < 0 || nextIndex >= runtime.exercises.length) {
    issues.push("no_next_exercise");
  }

  return Object.freeze(issues);
}
