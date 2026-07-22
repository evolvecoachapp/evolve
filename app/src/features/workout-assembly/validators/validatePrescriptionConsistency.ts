import type { WorkoutExercise } from "../models/WorkoutExercise";

/**
 * Validate prescription consistency on assembled exercises.
 */
export function validatePrescriptionConsistency(
  exercises: readonly WorkoutExercise[],
): readonly string[] {
  const issues: string[] = [];

  for (const exercise of exercises) {
    if (exercise.setCount < 1) {
      issues.push(`prescription_empty_sets:${exercise.id}`);
    }
    if (exercise.sets.length !== exercise.setCount) {
      issues.push(`prescription_set_count_mismatch:${exercise.id}`);
    }
    if (exercise.repMin < 1 || exercise.repMax < exercise.repMin) {
      issues.push(`prescription_rep_range_invalid:${exercise.id}`);
    }
    if (exercise.restSeconds < 0 || exercise.betweenSetsRestSeconds < 0) {
      issues.push(`prescription_rest_invalid:${exercise.id}`);
    }
    for (const set of exercise.sets) {
      if (set.repMin !== exercise.repMin || set.repMax !== exercise.repMax) {
        issues.push(`prescription_set_rep_mismatch:${exercise.id}:${set.setIndex}`);
      }
    }
  }

  return Object.freeze(issues);
}
