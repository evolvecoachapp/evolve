import type { WorkoutExercise } from "../models/WorkoutExercise";

/**
 * Prevent duplicate exercise ids and duplicate source exerciseIds in a session.
 */
export function validateDuplicatePrevention(
  exercises: readonly WorkoutExercise[],
): readonly string[] {
  const issues: string[] = [];
  const seenIds = new Set<string>();
  const seenExerciseIds = new Set<string>();

  for (const exercise of exercises) {
    if (seenIds.has(exercise.id)) {
      issues.push(`duplicate_workout_exercise_id:${exercise.id}`);
    }
    seenIds.add(exercise.id);

    if (seenExerciseIds.has(exercise.exerciseId)) {
      issues.push(`duplicate_exercise_id:${exercise.exerciseId}`);
    }
    seenExerciseIds.add(exercise.exerciseId);
  }

  return Object.freeze(issues);
}
