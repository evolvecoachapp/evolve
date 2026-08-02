import type { ProgressAnalyticsService } from "../services/ProgressAnalyticsService";
import { ProgressAnalyticsError } from "../services/ProgressAnalyticsService";

export const backendProgressAnalyticsService: ProgressAnalyticsService = {
  providerId: "backend",
  async getAnalytics() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getWorkoutHistory() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getBodyMeasurements() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getStrengthProgress() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getNutritionStatistics() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getRecoveryStatistics() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getGoalProgress() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getPersonalRecords() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async getAnalyticsSnapshot() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
  async applyWorkoutProgressEvent() {
    throw new ProgressAnalyticsError("Backend progress analytics provider is not configured.", "backend");
  },
};
