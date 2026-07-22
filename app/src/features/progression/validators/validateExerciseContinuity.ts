import type { ExerciseProgression } from "../models/ExerciseProgression";

/**
 * Validate each exercise keeps the same exerciseId across all weeks.
 */
export function validateExerciseContinuity(
  progressions: readonly ExerciseProgression[],
): readonly string[] {
  const issues: string[] = [];

  for (const progression of progressions) {
    for (const step of progression.steps) {
      if (step.exerciseId !== progression.exerciseId) {
        issues.push(
          `exercise_continuity_broken:${progression.exerciseId}->${step.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (step.prescriptionOrder !== progression.prescriptionOrder) {
        issues.push(
          `prescription_order_mismatch:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (step.role !== progression.role) {
        issues.push(
          `role_mismatch:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
    }
  }

  return Object.freeze(issues);
}
