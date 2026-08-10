import type { ProgressAnalyticsService } from "../services/ProgressAnalyticsService";
import { ProgressAnalyticsError } from "../services/ProgressAnalyticsService";

export const localProgressAnalyticsService: ProgressAnalyticsService = {
  providerId: "local",
  async getAnalytics() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getWorkoutHistory() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getBodyMeasurements() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getStrengthProgress() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getNutritionStatistics() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getRecoveryStatistics() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getGoalProgress() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getPersonalRecords() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async getAnalyticsSnapshot() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async applyWorkoutProgressEvent() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async applyNutritionProgressEvent() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async applyRecoveryProgressEvent() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
  async applyGoalProgressEvent() {
    throw new ProgressAnalyticsError("Local progress analytics provider is not configured.", "local");
  },
};
