import type { ExerciseProgression } from "../models/ExerciseProgression";

/**
 * Validate progression targets remain internally consistent.
 */
export function validateProgressionConsistency(
  progressions: readonly ExerciseProgression[],
): readonly string[] {
  const issues: string[] = [];

  for (const progression of progressions) {
    if (progression.baselineSets < 1) {
      issues.push(`baseline_sets_invalid:${progression.exerciseId}`);
    }
    if (progression.baselineRepMax < progression.baselineRepMin) {
      issues.push(`baseline_reps_invalid:${progression.exerciseId}`);
    }

    for (const step of progression.steps) {
      if (step.target.volumeSets < 1 || step.target.volumeSets > 12) {
        issues.push(
          `volume_sets_out_of_range:${progression.exerciseId}:week_${step.weekNumber}:${step.target.volumeSets}`,
        );
      }
      if (step.target.volumeRepMax < step.target.volumeRepMin) {
        issues.push(
          `volume_reps_invalid:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (step.target.volumeRepMin < 1) {
        issues.push(
          `volume_rep_min_invalid:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (
        step.target.intensityMetric !== "none" &&
        step.target.intensityValue === null
      ) {
        issues.push(
          `intensity_value_missing:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (
        step.target.intensityMetric === "rpe" &&
        step.target.intensityValue !== null &&
        (step.target.intensityValue < 1 || step.target.intensityValue > 10)
      ) {
        issues.push(
          `intensity_rpe_out_of_range:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (
        step.target.intensityMetric === "rir" &&
        step.target.intensityValue !== null &&
        (step.target.intensityValue < 0 || step.target.intensityValue > 10)
      ) {
        issues.push(
          `intensity_rir_out_of_range:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (step.target.frequencySessionsPerWeek < 1) {
        issues.push(
          `frequency_invalid:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
      if (step.target.rotationIndex < 0) {
        issues.push(
          `rotation_index_invalid:${progression.exerciseId}:week_${step.weekNumber}`,
        );
      }
    }
  }

  return Object.freeze(issues);
}
