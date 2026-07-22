import type { ExercisePrescription } from "../models/ExercisePrescription";

/**
 * Validate that each exercise appears at most once in the prescription list.
 */
export function validateExerciseUniqueness(
  prescriptions: readonly ExercisePrescription[],
): readonly string[] {
  const seen = new Set<string>();
  const issues: string[] = [];

  for (const prescription of prescriptions) {
    if (seen.has(prescription.exerciseId)) {
      issues.push(`duplicate_exercise:${prescription.exerciseId}`);
    } else {
      seen.add(prescription.exerciseId);
    }
  }

  return Object.freeze(issues);
}
