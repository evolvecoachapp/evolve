import type { ExerciseRuntime } from "../models/ExerciseRuntime";
import type { SetRuntime } from "../models/SetRuntime";
import type { WorkoutRuntime } from "../models/WorkoutRuntime";

/**
 * Validate that set progression / completion is legal for the current runtime.
 */
export function validateSetProgression(
  runtime: WorkoutRuntime,
): readonly string[] {
  const issues: string[] = [];

  if (runtime.state !== "Running") {
    issues.push(`set_progression_requires_running:${runtime.state}`);
  }

  const exercise = getCurrentExercise(runtime);
  if (!exercise) {
    issues.push("no_current_exercise");
    return Object.freeze(issues);
  }

  if (exercise.state !== "Active") {
    issues.push(`exercise_not_active:${exercise.id}:${exercise.state}`);
  }

  const currentSet = getCurrentSet(exercise);
  if (!currentSet) {
    issues.push(`no_current_set:${exercise.id}`);
    return Object.freeze(issues);
  }

  if (currentSet.state !== "Active") {
    issues.push(`set_not_active:${currentSet.id}:${currentSet.state}`);
  }

  if (currentSet.completed) {
    issues.push(`set_already_completed:${currentSet.id}`);
  }

  return Object.freeze(issues);
}

/**
 * Validate advancing to the next set within the current exercise.
 */
export function validateAdvanceSet(
  exercise: ExerciseRuntime,
): readonly string[] {
  const issues: string[] = [];
  const currentSet = getCurrentSet(exercise);

  if (!currentSet) {
    issues.push(`no_current_set:${exercise.id}`);
    return Object.freeze(issues);
  }

  if (!currentSet.completed && currentSet.state !== "Skipped") {
    issues.push(`current_set_incomplete:${currentSet.id}`);
  }

  const nextPending = exercise.sets.find(
    (set) => set.state === "Pending" && set.setIndex > currentSet.setIndex,
  );
  if (!nextPending) {
    issues.push(`no_next_set:${exercise.id}`);
  }

  return Object.freeze(issues);
}

export function getCurrentExercise(
  runtime: WorkoutRuntime,
): ExerciseRuntime | null {
  if (runtime.currentExerciseIndex === null) {
    return null;
  }
  return runtime.exercises[runtime.currentExerciseIndex] ?? null;
}

export function getCurrentSet(exercise: ExerciseRuntime): SetRuntime | null {
  if (exercise.currentSetIndex === null) {
    return null;
  }
  return (
    exercise.sets.find((set) => set.setIndex === exercise.currentSetIndex) ??
    null
  );
}
