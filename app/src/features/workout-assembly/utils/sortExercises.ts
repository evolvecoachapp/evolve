import type { WorkoutExercise } from "../models/WorkoutExercise";

/**
 * Sort assembled exercises by execution order (ascending), then id.
 */
export function sortExercises(
  exercises: readonly WorkoutExercise[],
): readonly WorkoutExercise[] {
  return Object.freeze(
    [...exercises].sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.id.localeCompare(right.id);
    }),
  );
}

export function compareExercises(
  left: WorkoutExercise,
  right: WorkoutExercise,
): number {
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  return left.id.localeCompare(right.id);
}
