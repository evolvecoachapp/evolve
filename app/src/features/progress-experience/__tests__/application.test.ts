import {
  loadBodyMetrics,
  loadCoachInsights,
  loadNutritionProgress,
  loadProgressDashboard,
  loadRecoveryProgress,
  loadStrengthProgress,
  loadVolumeProgress,
  refreshProgressDashboard,
} from "../application";
import { TimeRanges } from "../models";
import { mockProgressExperienceService } from "../providers/MockProgressExperienceService";
import type { ProgressExperienceService } from "../services";
import { ProgressExperienceError } from "../services";

function createFailingService(): ProgressExperienceService {
  return {
    providerId: "mock",
    async getDashboard() { throw new ProgressExperienceError("dashboard failed", "mock"); },
    async getStrengthProgress() { throw new ProgressExperienceError("strength failed", "mock"); },
    async getVolumeProgress() { throw new ProgressExperienceError("volume failed", "mock"); },
    async getRecoveryProgress() { throw new ProgressExperienceError("recovery failed", "mock"); },
    async getNutritionProgress() { throw new ProgressExperienceError("nutrition failed", "mock"); },
    async getBodyMetrics() { throw new ProgressExperienceError("body failed", "mock"); },
    async getCoachInsights() { throw new ProgressExperienceError("insights failed", "mock"); },
  };
}

describe("progress-experience application APIs", () => {
  it("loads a full immutable dashboard", async () => {
    const dashboard = await loadProgressDashboard({ service: mockProgressExperienceService, timeRange: TimeRanges.LAST_30_DAYS });
    expect(Object.isFrozen(dashboard)).toBe(true);
    expect(dashboard.strength.estimatedOneRepMaxKg).toBeGreaterThan(0);
    expect(dashboard.volume.totalVolumeKg).toBeGreaterThan(0);
    expect(dashboard.coachInsights.length).toBeGreaterThan(0);
    expect(dashboard.personalRecords.length).toBeGreaterThan(0);
  });

  it("refresh returns a fresh mapped dashboard", async () => {
    const first = await loadProgressDashboard({ service: mockProgressExperienceService });
    const second = await refreshProgressDashboard({ service: mockProgressExperienceService });
    expect(second).not.toBe(first);
    expect(second.timeRange).toBe(first.timeRange);
  });

  it("loads section projections for the selected time range", async () => {
    const strength = await loadStrengthProgress({ service: mockProgressExperienceService, timeRange: TimeRanges.LAST_7_DAYS });
    const volume = await loadVolumeProgress({ service: mockProgressExperienceService, timeRange: TimeRanges.LAST_90_DAYS });
    const recovery = await loadRecoveryProgress({ service: mockProgressExperienceService });
    const nutrition = await loadNutritionProgress({ service: mockProgressExperienceService });
    const bodyMetrics = await loadBodyMetrics({ service: mockProgressExperienceService });
    const insights = await loadCoachInsights({ service: mockProgressExperienceService });
    expect(strength.chart.points.length).toBeGreaterThan(0);
    expect(volume.totalVolumeKg).toBeGreaterThan(0);
    expect(recovery.averageScore).toBeGreaterThanOrEqual(0);
    expect(nutrition.proteinAdherencePercent).toBeGreaterThan(0);
    expect(bodyMetrics.bodyWeightKg).toBeGreaterThan(0);
    expect(insights.length).toBeGreaterThan(0);
  });

  it("propagates provider failures", async () => {
    await expect(loadProgressDashboard({ service: createFailingService() })).rejects.toThrow("dashboard failed");
  });
});
