import { ProgressExperienceError, type ProgressExperienceService } from "../services";

function notConfigured(): never {
  throw new ProgressExperienceError("Backend Progress Experience provider is not configured.", "backend");
}

export const backendProgressExperienceService: ProgressExperienceService = {
  providerId: "backend",
  async getDashboard() { return notConfigured(); },
  async getStrengthProgress() { return notConfigured(); },
  async getVolumeProgress() { return notConfigured(); },
  async getRecoveryProgress() { return notConfigured(); },
  async getNutritionProgress() { return notConfigured(); },
  async getBodyMetrics() { return notConfigured(); },
  async getCoachInsights() { return notConfigured(); },
};
