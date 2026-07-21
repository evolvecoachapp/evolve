import type { AthleteProfile } from "../models/AthleteProfile";
import type {
  AthleteContextValidationIssue,
  AthleteContextValidationResult,
} from "../models/AthleteContextValidationResult";
import { INTENSITY_BIASES, PREFERRED_SPLITS } from "../models/TrainingPreference";
import { validateAge } from "./validateAge";
import { validateAvailability } from "./validateAvailability";
import { validateEquipment } from "./validateEquipment";
import { validateExperience } from "./validateExperience";
import { validateGoal } from "./validateGoal";
import { validateHeight } from "./validateHeight";
import { validateInjuries } from "./validateInjuries";
import { validateWeight } from "./validateWeight";

/**
 * Validate a complete AthleteProfile.
 *
 * Returns a structured result; never throws for validation failures.
 */
export function validateAthleteContext(
  profile: AthleteProfile,
): AthleteContextValidationResult {
  const issues: AthleteContextValidationIssue[] = [];

  if (profile.id.trim().length === 0) {
    issues.push(
      Object.freeze({
        field: "id",
        code: "missing_profile_id" as const,
      }),
    );
  }

  issues.push(
    ...validateAge(profile.ageYears),
    ...validateHeight(profile.heightCm),
    ...validateWeight(profile.weightKg),
    ...validateGoal(profile.goal),
    ...validateExperience(profile.experience),
    ...validateAvailability(profile.availability),
    ...validateEquipment(profile.equipment),
    ...validateInjuries(profile.injuries),
  );

  if (
    profile.preference.preferredSplit !== null &&
    !(PREFERRED_SPLITS as readonly string[]).includes(
      profile.preference.preferredSplit,
    )
  ) {
    issues.push(
      Object.freeze({
        field: "preference.preferredSplit",
        code: "invalid_preferred_split" as const,
      }),
    );
  }

  if (
    !(INTENSITY_BIASES as readonly string[]).includes(
      profile.preference.intensityBias,
    )
  ) {
    issues.push(
      Object.freeze({
        field: "preference.intensityBias",
        code: "invalid_intensity_bias" as const,
      }),
    );
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
