import type { ExercisePrescription } from "../models/ExercisePrescription";

const MIN_SETS = 1;
const MAX_SETS = 10;
const MIN_REPS = 1;
const MAX_REPS = 50;

/**
 * Validate volume (sets / rep range) is within allowed bounds.
 */
export function validateVolumeRanges(
  prescriptions: readonly ExercisePrescription[],
): readonly string[] {
  const issues: string[] = [];

  for (const prescription of prescriptions) {
    const { sets, repMin, repMax } = prescription.volume;

    if (sets < MIN_SETS || sets > MAX_SETS) {
      issues.push(`volume_sets_out_of_range:${prescription.exerciseId}:${sets}`);
    }
    if (repMin < MIN_REPS || repMin > MAX_REPS) {
      issues.push(
        `volume_rep_min_out_of_range:${prescription.exerciseId}:${repMin}`,
      );
    }
    if (repMax < MIN_REPS || repMax > MAX_REPS) {
      issues.push(
        `volume_rep_max_out_of_range:${prescription.exerciseId}:${repMax}`,
      );
    }
    if (repMin > repMax) {
      issues.push(`volume_rep_range_invalid:${prescription.exerciseId}`);
    }
  }

  return Object.freeze(issues);
}
