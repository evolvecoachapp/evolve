import type { ProfileExperienceService } from "../services";
import { ProfileExperienceError } from "../services";

export const backendProfileExperienceService: ProfileExperienceService = {
  providerId: "backend",
  async getProfile() {
    throw new ProfileExperienceError("Backend profile experience provider is not configured.", "backend");
  },
  async updateTrainingPreferences() {
    throw new ProfileExperienceError("Backend profile training preferences provider is not configured.", "backend");
  },
  async updateNutritionPreferences() {
    throw new ProfileExperienceError("Backend profile nutrition preferences provider is not configured.", "backend");
  },
  async updateCoachPreferences() {
    throw new ProfileExperienceError("Backend profile coach preferences provider is not configured.", "backend");
  },
  async updateNotificationPreferences() {
    throw new ProfileExperienceError("Backend profile notification preferences provider is not configured.", "backend");
  },
  async updateAppearancePreferences() {
    throw new ProfileExperienceError("Backend profile appearance preferences provider is not configured.", "backend");
  },
  async updateMeasurementUnits() {
    throw new ProfileExperienceError("Backend profile measurement units provider is not configured.", "backend");
  },
  async updateGoals() {
    throw new ProfileExperienceError("Backend profile goals provider is not configured.", "backend");
  },
};
