import { buildDisplayName, toNumberOrNull } from "../../shared/utils/userAdapters";
import type { UserPublic } from "../../../types/api";
import type { AthleteProfileDto } from "../services";
import { DEFAULT_CONNECTED_SERVICES, DEFAULT_SECTIONS } from "./mapAthleteIdentityToProfile";

/**
 * The Profile Experience domains beyond identity (training / nutrition /
 * coach / notifications / appearance / units / goals) have no equivalent
 * field on `/api/v1/users/me` — see `backend/app/schemas/user.py`. These
 * defaults intentionally mirror the "unsupported" placeholders already used
 * by `mapAthleteIdentityToProfile` rather than inventing backend data.
 */
function buildUnsupportedProfileDefaults(): Pick<
  AthleteProfileDto,
  | "goals"
  | "trainingPreferences"
  | "nutritionPreferences"
  | "coachPreferences"
  | "notificationPreferences"
  | "appearancePreferences"
  | "measurementUnits"
  | "connectedServices"
  | "sections"
> {
  return {
    goals: Object.freeze([]),
    trainingPreferences: {
      level: "beginner",
      sessionsPerWeek: 0,
      preferredDuration: 0,
      preferredTime: "",
      focusAreas: Object.freeze([]),
      equipmentAvailable: Object.freeze([]),
      destination: "/(app)/profile/training-preferences",
    },
    nutritionPreferences: {
      dietaryApproach: "balanced",
      calorieTarget: 0,
      mealsPerDay: 0,
      allergies: Object.freeze([]),
      supplements: Object.freeze([]),
      destination: "/(app)/profile/nutrition-preferences",
    },
    coachPreferences: {
      coachingStyle: "supportive",
      motivationLevel: "moderate",
      feedbackFrequency: "regular",
      explanationDepth: "moderate",
      destination: "/(app)/profile/coach-preferences",
    },
    notificationPreferences: {
      workoutReminders: false,
      mealReminders: false,
      hydrationReminders: false,
      coachMessages: false,
      progressUpdates: false,
      destination: "/(app)/profile/notification-preferences",
    },
    appearancePreferences: {
      theme: "system",
      accentColor: null,
      destination: "/(app)/profile/appearance",
    },
    measurementUnits: {
      weight: "kg",
      distance: "km",
      height: "cm",
    },
    connectedServices: Object.freeze(
      DEFAULT_CONNECTED_SERVICES.map((service) => ({
        kind: service.kind,
        label: service.label,
        isConnected: false,
        lastSyncLabel: null,
        destination: `/(app)/profile/service/${service.kind}`,
      })),
    ),
    sections: Object.freeze(DEFAULT_SECTIONS.map((section) => ({ ...section }))),
  };
}

export function computeAgeFromBirthDate(birthDate: string | null, referenceDate: Date): number | null {
  if (!birthDate) {
    return null;
  }
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  let age = referenceDate.getFullYear() - parsed.getFullYear();
  const referenceHasHadBirthdayThisYear =
    referenceDate.getMonth() > parsed.getMonth() ||
    (referenceDate.getMonth() === parsed.getMonth() && referenceDate.getDate() >= parsed.getDate());
  if (!referenceHasHadBirthdayThisYear) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export interface MapUserPublicToProfileDtoOptions {
  readonly referenceDate?: Date;
  readonly appVersion?: string;
}

/**
 * Projects the backend's `UserPublic` (`GET`/`PATCH /api/v1/users/me`)
 * response into the Profile Experience provider DTO. Only fields the
 * backend actually owns (name, email, birth date, height, weight, account
 * status) are populated from live data — everything else uses the same
 * "unsupported" defaults as the runtime/local provider.
 */
export function mapUserPublicToProfileDto(
  user: UserPublic,
  options: MapUserPublicToProfileDtoOptions = {},
): AthleteProfileDto {
  const referenceDate = options.referenceDate ?? new Date();
  const defaults = buildUnsupportedProfileDefaults();

  return {
    id: user.id,
    displayName: buildDisplayName(user),
    email: user.email,
    avatarUrl: null,
    joinDate: user.created_at.slice(0, 10),
    bio: "",
    age: computeAgeFromBirthDate(user.birth_date, referenceDate),
    heightCm: toNumberOrNull(user.height_cm),
    weightKg: toNumberOrNull(user.current_weight_kg),
    firstName: user.first_name,
    lastName: user.last_name,
    gender: user.gender,
    birthDate: user.birth_date,
    targetWeightKg: toNumberOrNull(user.target_weight_kg),
    primaryGoal: user.goal,
    activityLevel: user.activity_level,
    ...defaults,
    accountStatus: user.is_active ? "Active" : "Inactive",
    appVersion: options.appVersion ?? "",
    editProfileDestination: "/(app)/profile/edit",
    privacyDestination: "/(app)/profile/privacy",
    aboutDestination: "/(app)/profile/about",
  };
}
