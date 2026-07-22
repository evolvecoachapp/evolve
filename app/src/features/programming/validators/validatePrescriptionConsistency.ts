import type { ExercisePrescription } from "../models/ExercisePrescription";

/**
 * Validate internal consistency of each prescription.
 */
export function validatePrescriptionConsistency(
  prescriptions: readonly ExercisePrescription[],
): readonly string[] {
  const issues: string[] = [];

  for (const prescription of prescriptions) {
    if (prescription.exerciseId !== prescription.exercise.id) {
      issues.push(
        `prescription_exercise_id_mismatch:${prescription.exerciseId}`,
      );
    }

    if (prescription.volume.sets !== prescription.sets.length) {
      issues.push(`volume_sets_mismatch:${prescription.exerciseId}`);
    }

    if (prescription.volume.repMin > prescription.volume.repMax) {
      issues.push(`rep_range_inverted:${prescription.exerciseId}`);
    }

    if (
      prescription.volume.totalRepsMin !==
      prescription.volume.sets * prescription.volume.repMin
    ) {
      issues.push(`total_reps_min_mismatch:${prescription.exerciseId}`);
    }

    if (
      prescription.volume.totalRepsMax !==
      prescription.volume.sets * prescription.volume.repMax
    ) {
      issues.push(`total_reps_max_mismatch:${prescription.exerciseId}`);
    }

    for (const set of prescription.sets) {
      if (set.repMin !== prescription.volume.repMin) {
        issues.push(
          `set_rep_min_mismatch:${prescription.exerciseId}:${set.setIndex}`,
        );
      }
      if (set.repMax !== prescription.volume.repMax) {
        issues.push(
          `set_rep_max_mismatch:${prescription.exerciseId}:${set.setIndex}`,
        );
      }
    }

    if (prescription.rest.seconds !== prescription.rest.betweenSetsSeconds) {
      issues.push(`rest_seconds_mismatch:${prescription.exerciseId}`);
    }

    if (prescription.order < 1) {
      issues.push(`order_not_positive:${prescription.exerciseId}`);
    }

    if (prescription.priority < 1) {
      issues.push(`priority_not_positive:${prescription.exerciseId}`);
    }
  }

  return Object.freeze(issues);
}
