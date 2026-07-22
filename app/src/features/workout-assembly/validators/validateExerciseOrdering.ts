import type { WorkoutExercise } from "../models/WorkoutExercise";

/**
 * Validate that exercises are ordered ascending by order field with unique orders.
 */
export function validateExerciseOrdering(
  exercises: readonly WorkoutExercise[],
): readonly string[] {
  const issues: string[] = [];
  const seenOrders = new Set<number>();

  for (let index = 0; index < exercises.length; index += 1) {
    const exercise = exercises[index]!;
    if (seenOrders.has(exercise.order)) {
      issues.push(`exercise_duplicate_order:${exercise.order}`);
    }
    seenOrders.add(exercise.order);

    if (index > 0) {
      const previous = exercises[index - 1]!;
      if (exercise.order < previous.order) {
        issues.push(`exercise_order_not_ascending:${previous.id}->${exercise.id}`);
      }
    }

    if (exercise.order < 1) {
      issues.push(`exercise_order_invalid:${exercise.id}`);
    }
  }

  return Object.freeze(issues);
}
