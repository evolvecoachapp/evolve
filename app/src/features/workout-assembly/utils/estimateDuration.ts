import type { WorkoutExercise } from "../models/WorkoutExercise";

/**
 * Estimate total session duration in seconds from assembled exercises.
 * Sums per-exercise estimates (already include set work + rest).
 */
export function estimateDuration(
  exercises: readonly WorkoutExercise[],
): number {
  return exercises.reduce(
    (sum, exercise) => sum + exercise.estimatedDurationSeconds,
    0,
  );
}

/**
 * Estimate duration for one exercise from sets and rest.
 */
export function estimateExerciseDurationSeconds(input: {
  readonly setCount: number;
  readonly betweenSetsRestSeconds: number;
  readonly workSecondsPerSet?: number;
}): number {
  const workSecondsPerSet = input.workSecondsPerSet ?? 40;
  if (input.setCount <= 0) {
    return 0;
  }
  const work = input.setCount * workSecondsPerSet;
  const rest =
    Math.max(0, input.setCount - 1) * input.betweenSetsRestSeconds;
  return work + rest;
}
