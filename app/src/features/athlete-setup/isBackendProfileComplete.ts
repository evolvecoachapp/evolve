import type { ActivityLevel, Gender, Goal, UserPublic } from "../../types/api";
import { toNumberOrNull } from "../shared/utils/userAdapters";
import { needsTargetWeight } from "./models";

/** Fields the Profile read model must expose for Sprint 1 completeness. */
export interface AthleteSetupCompletenessFields {
  readonly firstName: string | null;
  readonly birthDate: string | null;
  readonly gender: Gender | null;
  readonly heightCm: number | null;
  readonly weightKg: number | null;
  readonly primaryGoal: Goal | null;
  readonly activityLevel: ActivityLevel | null;
  readonly targetWeightKg: number | null;
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPositiveMeasurement(value: number | string | null | undefined): boolean {
  const parsed = toNumberOrNull(value);
  return parsed != null && parsed > 0;
}

/**
 * True when the backend User row has everything Sprint 1 onboarding collects.
 * Tracked `goals` table rows are intentionally not required.
 */
export function isBackendProfileComplete(user: UserPublic | null | undefined): boolean {
  if (!user) {
    return false;
  }

  if (!hasText(user.first_name) || !hasText(user.birth_date) || !user.gender) {
    return false;
  }
  if (!hasPositiveMeasurement(user.height_cm) || !hasPositiveMeasurement(user.current_weight_kg)) {
    return false;
  }
  if (!user.goal || !user.activity_level) {
    return false;
  }
  if (needsTargetWeight(user.goal) && !hasPositiveMeasurement(user.target_weight_kg)) {
    return false;
  }
  return true;
}

/** Same completeness check against the merged Profile Experience read model. */
export function isAthleteSetupComplete(
  profile: AthleteSetupCompletenessFields | null | undefined,
): boolean {
  if (!profile) {
    return false;
  }
  if (!hasText(profile.firstName) || !hasText(profile.birthDate) || !profile.gender) {
    return false;
  }
  if (
    profile.heightCm == null ||
    profile.heightCm <= 0 ||
    profile.weightKg == null ||
    profile.weightKg <= 0
  ) {
    return false;
  }
  if (!profile.primaryGoal || !profile.activityLevel) {
    return false;
  }
  if (
    needsTargetWeight(profile.primaryGoal) &&
    (profile.targetWeightKg == null || profile.targetWeightKg <= 0)
  ) {
    return false;
  }
  return true;
}
