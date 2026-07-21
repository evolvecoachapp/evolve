import type { TrainingExperience } from "../models/TrainingExperience";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Derive training age in whole years from experience fields.
 *
 * Prefers `trainingStartedAt` when parseable; otherwise uses
 * `yearsTraining`. Returns null when neither is available.
 */
export function calculateTrainingAge(
  experience: TrainingExperience,
  referenceDate: Date = new Date(),
): number | null {
  if (experience.trainingStartedAt !== null) {
    const startedAt = Date.parse(experience.trainingStartedAt);
    if (!Number.isNaN(startedAt) && startedAt <= referenceDate.getTime()) {
      const years = Math.floor(
        (referenceDate.getTime() - startedAt) / MS_PER_YEAR,
      );
      return Math.max(0, years);
    }
  }

  if (
    experience.yearsTraining !== null &&
    Number.isFinite(experience.yearsTraining) &&
    experience.yearsTraining >= 0
  ) {
    return Math.floor(experience.yearsTraining);
  }

  return null;
}
