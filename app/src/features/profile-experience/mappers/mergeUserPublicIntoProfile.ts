import { buildDisplayName, toNumberOrNull } from "../../shared/utils/userAdapters";
import type { UserPublic } from "../../../types/api";
import { createAthleteProfile, type AthleteProfile } from "../models";
import { computeAgeFromBirthDate } from "./mapUserPublicToProfileDto";

/**
 * Overlays live `GET /users/me` fields onto a hydrated Athlete Identity
 * projection. Identity-only fields (training prefs, appearance, units) stay.
 */
export function mergeUserPublicIntoProfile(
  profile: AthleteProfile,
  user: UserPublic | null | undefined,
  referenceDate: Date = new Date(),
): AthleteProfile {
  if (!user) {
    return profile;
  }

  return createAthleteProfile({
    ...profile,
    displayName: buildDisplayName(user) || profile.displayName,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    gender: user.gender,
    birthDate: user.birth_date,
    age: computeAgeFromBirthDate(user.birth_date, referenceDate) ?? profile.age,
    heightCm: toNumberOrNull(user.height_cm) ?? profile.heightCm,
    weightKg: toNumberOrNull(user.current_weight_kg) ?? profile.weightKg,
    targetWeightKg: toNumberOrNull(user.target_weight_kg),
    primaryGoal: user.goal,
    activityLevel: user.activity_level,
  });
}
