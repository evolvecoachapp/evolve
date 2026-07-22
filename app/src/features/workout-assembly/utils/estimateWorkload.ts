import type { WorkoutExercise } from "../models/WorkoutExercise";

/**
 * Estimate session workload as sum of set × mid-rep × fatigue factors.
 */
export function estimateWorkload(
  exercises: readonly WorkoutExercise[],
): number {
  return round3(
    exercises.reduce((sum, exercise) => sum + exercise.estimatedWorkload, 0),
  );
}

/**
 * Deterministic per-exercise workload estimate.
 */
export function estimateExerciseWorkload(input: {
  readonly setCount: number;
  readonly repMin: number;
  readonly repMax: number;
  readonly fatigueEstimate: number;
}): number {
  const midReps = (input.repMin + input.repMax) / 2;
  const volume = input.setCount * midReps;
  const fatigueFactor = 1 + input.fatigueEstimate / 10;
  return round3(volume * fatigueFactor);
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
