import { getCurrentUser } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import { updateCurrentUser } from "../../../api/users";
import type { UserUpdate } from "../../../types/api";
import { mapUserPublicToProfileDto } from "../mappers/mapUserPublicToProfileDto";
import type { AthleteInfoUpdateDto, ProfileExperienceService } from "../services";
import { ProfileExperienceError } from "../services";

/**
 * Backend provider — the only one of the three Profile Experience providers
 * that actually talks to the network. Reuses the existing authenticated API
 * client (`src/api/client.ts`'s `request()`, via `src/api/auth.ts` and
 * `src/api/users.ts`) against the already-implemented
 * `GET`/`PATCH /api/v1/users/me` endpoints — no new networking
 * infrastructure, schemas, or backend changes.
 *
 * Only the fields `UserPublic`/`UserUpdate` actually expose (name, email,
 * birth date, height, weight, activity level, goal, account status) can be
 * backed by this provider. Training / nutrition / coach / notification /
 * appearance / measurement-unit / goal-progress preferences have no
 * corresponding backend field (see `backend/app/schemas/user.py`) and stay
 * explicitly unsupported here rather than inventing one.
 */

function toProfileExperienceError(error: unknown, fallback: string): ProfileExperienceError {
  if (error instanceof ProfileExperienceError) {
    return error;
  }
  if (error instanceof ApiError) {
    return new ProfileExperienceError(error.message, "backend");
  }
  return new ProfileExperienceError(error instanceof Error ? error.message : fallback, "backend");
}

function unsupportedField(name: string): ProfileExperienceError {
  return new ProfileExperienceError(
    `${name} is not supported by the backend user API yet — see /api/v1/users/me.`,
    "backend",
  );
}

export const backendProfileExperienceService: ProfileExperienceService = {
  providerId: "backend",

  async getProfile() {
    try {
      const user = await getCurrentUser();
      return mapUserPublicToProfileDto(user);
    } catch (error) {
      throw toProfileExperienceError(error, "Failed to load your profile.");
    }
  },

  async updateAthleteInfo(input: AthleteInfoUpdateDto) {
    const data: UserUpdate = {};
    if (input.heightCm !== undefined && input.heightCm !== null) {
      data.height_cm = input.heightCm;
    }
    if (input.weightKg !== undefined && input.weightKg !== null) {
      data.current_weight_kg = input.weightKg;
    }

    try {
      const user = await updateCurrentUser(data);
      return mapUserPublicToProfileDto(user);
    } catch (error) {
      throw toProfileExperienceError(error, "Failed to update your profile.");
    }
  },

  async updateTrainingPreferences() {
    throw unsupportedField("Training preferences");
  },
  async updateNutritionPreferences() {
    throw unsupportedField("Nutrition preferences");
  },
  async updateCoachPreferences() {
    throw unsupportedField("Coach preferences");
  },
  async updateNotificationPreferences() {
    throw unsupportedField("Notification preferences");
  },
  async updateAppearancePreferences() {
    throw unsupportedField("Appearance preferences");
  },
  async updateMeasurementUnits() {
    throw unsupportedField("Measurement units");
  },
  async updateGoals() {
    throw unsupportedField("Goals");
  },
};
