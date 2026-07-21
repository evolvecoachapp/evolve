import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";
import {
  EXPERIENCE_LEVELS,
  type TrainingExperience,
} from "../models/TrainingExperience";

const MAX_YEARS_TRAINING = 80;

/**
 * Validate training experience fields.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateExperience(
  experience: TrainingExperience,
): readonly AthleteContextValidationIssue[] {
  const issues: AthleteContextValidationIssue[] = [];

  if (!(EXPERIENCE_LEVELS as readonly string[]).includes(experience.level)) {
    issues.push(
      Object.freeze({
        field: "experience.level",
        code: "invalid_experience_level" as const,
      }),
    );
  }

  if (experience.yearsTraining !== null) {
    if (
      !Number.isFinite(experience.yearsTraining) ||
      experience.yearsTraining < 0 ||
      experience.yearsTraining > MAX_YEARS_TRAINING
    ) {
      issues.push(
        Object.freeze({
          field: "experience.yearsTraining",
          code: "invalid_years_training" as const,
        }),
      );
    }
  }

  if (experience.trainingStartedAt !== null) {
    const parsed = Date.parse(experience.trainingStartedAt);
    if (Number.isNaN(parsed)) {
      issues.push(
        Object.freeze({
          field: "experience.trainingStartedAt",
          code: "invalid_training_started_at" as const,
        }),
      );
    }
  }

  return Object.freeze(issues);
}
