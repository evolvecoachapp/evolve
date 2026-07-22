import type { ExercisePrescription } from "../models/ExercisePrescription";

/**
 * Estimate relative workload units for a prescription.
 * Simple sets × mean reps × intensity factor — not load prediction.
 */
export function estimateWorkload(prescription: ExercisePrescription): number {
  const sets = prescription.volume.sets;
  if (sets <= 0) {
    return 0;
  }
  const meanReps =
    (prescription.volume.repMin + prescription.volume.repMax) / 2;
  const intensityFactor =
    prescription.intensity.targetRpe !== null
      ? prescription.intensity.targetRpe / 10
      : prescription.intensity.targetRir !== null
        ? Math.max(0.4, (10 - prescription.intensity.targetRir) / 10)
        : 0.7;
  return Math.round(sets * meanReps * intensityFactor * 1000) / 1000;
}
