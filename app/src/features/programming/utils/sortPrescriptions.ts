import type { ExercisePrescription } from "../models/ExercisePrescription";

/**
 * Sort prescriptions by execution order ascending, then exerciseId ascending.
 */
export function sortPrescriptions(
  prescriptions: readonly ExercisePrescription[],
): readonly ExercisePrescription[] {
  return Object.freeze(
    [...prescriptions].sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.exerciseId.localeCompare(right.exerciseId);
    }),
  );
}

/**
 * Compare two prescriptions by order then id (for stable sorts).
 */
export function comparePrescriptionsByOrderThenId(
  left: Pick<ExercisePrescription, "order" | "exerciseId">,
  right: Pick<ExercisePrescription, "order" | "exerciseId">,
): number {
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  return left.exerciseId.localeCompare(right.exerciseId);
}
