import type { ExercisePrescription } from "../models/ExercisePrescription";

const MIN_REST_SECONDS = 15;
const MAX_REST_SECONDS = 600;

/**
 * Validate rest intervals are within allowed bounds.
 */
export function validateRestRanges(
  prescriptions: readonly ExercisePrescription[],
): readonly string[] {
  const issues: string[] = [];

  for (const prescription of prescriptions) {
    const seconds = prescription.rest.seconds;
    if (seconds < MIN_REST_SECONDS || seconds > MAX_REST_SECONDS) {
      issues.push(
        `rest_out_of_range:${prescription.exerciseId}:${seconds}`,
      );
    }
  }

  return Object.freeze(issues);
}
