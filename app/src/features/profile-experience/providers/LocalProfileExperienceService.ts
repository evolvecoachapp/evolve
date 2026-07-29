import type { ProfileExperienceService } from "../services";
import { ProfileExperienceError } from "../services";

export const localProfileExperienceService: ProfileExperienceService = {
  providerId: "local",
  async getProfile() {
    throw new ProfileExperienceError("Local profile experience provider is not configured.", "local");
  },
  async updateTrainingPreferences() {
    throw new ProfileExperienceError("Local profile training preferences provider is not configured.", "local");
  },
  async updateNutritionPreferences() {
    throw new ProfileExperienceError("Local profile nutrition preferences provider is not configured.", "local");
  },
  async updateCoachPreferences() {
    throw new ProfileExperienceError("Local profile coach preferences provider is not configured.", "local");
  },
  async updateNotificationPreferences() {
    throw new ProfileExperienceError("Local profile notification preferences provider is not configured.", "local");
  },
  async updateAppearancePreferences() {
    throw new ProfileExperienceError("Local profile appearance preferences provider is not configured.", "local");
  },
  async updateMeasurementUnits() {
    throw new ProfileExperienceError("Local profile measurement units provider is not configured.", "local");
  },
  async updateGoals() {
    throw new ProfileExperienceError("Local profile goals provider is not configured.", "local");
  },
};
