import type { ExercisePrescription } from "../models/ExercisePrescription";

/**
 * Estimate systemic fatigue contribution for a prescription in [0, 10].
 * Combines exercise KB fatigue with programmed volume — no adaptation.
 */
export function estimateFatigue(prescription: ExercisePrescription): number {
  const base = prescription.exercise.fatigueScore;
  const volumeFactor = Math.min(1.5, 0.7 + prescription.volume.sets * 0.1);
  const intensityBoost =
    prescription.intensity.targetRpe !== null
      ? Math.max(0, (prescription.intensity.targetRpe - 6) * 0.15)
      : 0;
  const raw = base * volumeFactor + intensityBoost;
  return Math.round(Math.min(10, Math.max(0, raw)) * 1000) / 1000;
}
