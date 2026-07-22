import type { ExercisePrescription } from "../models/ExercisePrescription";

const MIN_RPE = 1;
const MAX_RPE = 10;
const MIN_RIR = 0;
const MAX_RIR = 10;

/**
 * Validate intensity targets are within allowed RPE / RIR ranges.
 */
export function validateIntensityRanges(
  prescriptions: readonly ExercisePrescription[],
): readonly string[] {
  const issues: string[] = [];

  for (const prescription of prescriptions) {
    const { intensity } = prescription;

    if (intensity.metric === "none") {
      issues.push(`intensity_metric_none:${prescription.exerciseId}`);
      continue;
    }

    if (intensity.targetRpe !== null) {
      if (intensity.targetRpe < MIN_RPE || intensity.targetRpe > MAX_RPE) {
        issues.push(
          `intensity_rpe_out_of_range:${prescription.exerciseId}:${intensity.targetRpe}`,
        );
      }
    }

    if (intensity.targetRir !== null) {
      if (intensity.targetRir < MIN_RIR || intensity.targetRir > MAX_RIR) {
        issues.push(
          `intensity_rir_out_of_range:${prescription.exerciseId}:${intensity.targetRir}`,
        );
      }
    }

    if (intensity.metric === "rpe" && intensity.value !== intensity.targetRpe) {
      issues.push(`intensity_rpe_value_mismatch:${prescription.exerciseId}`);
    }

    if (intensity.metric === "rir" && intensity.value !== intensity.targetRir) {
      issues.push(`intensity_rir_value_mismatch:${prescription.exerciseId}`);
    }
  }

  return Object.freeze(issues);
}
