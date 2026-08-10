import { emptyMockProgressExperienceService, mockProgressExperienceService } from "../providers/MockProgressExperienceService";
import { mockProgressAnalyticsService } from "../../progress-analytics/providers/MockProgressAnalyticsService";
import { mapProgressAnalyticsToExperienceDto } from "../mappers/mapProgressAnalyticsToExperienceDto";
import { mapProgressDashboard } from "../mappers";
import { ProgressLoadingStatuses, TimeRanges } from "../models";
import type { ProgressExperienceService } from "../services";
import { ProgressExperienceError } from "../services";
import { ProgressExperienceViewModel } from "../viewmodels";

describe("ProgressExperienceViewModel", () => {
  it("loads dashboard analytics", async () => {
    const viewModel = new ProgressExperienceViewModel({ service: mockProgressExperienceService });
    await viewModel.loadDashboard();
    expect(viewModel.loading.status).toBe(ProgressLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard?.headline).toContain("1RM");
    expect(viewModel.coachInsights.length).toBeGreaterThan(0);
  });

  it("exposes error state when provider fails", async () => {
    const failing: ProgressExperienceService = {
      providerId: "mock",
      async getDashboard() { throw new ProgressExperienceError("load failed", "mock"); },
      async getStrengthProgress() { throw new ProgressExperienceError("strength failed", "mock"); },
      async getVolumeProgress() { throw new ProgressExperienceError("volume failed", "mock"); },
      async getRecoveryProgress() { throw new ProgressExperienceError("recovery failed", "mock"); },
      async getNutritionProgress() { throw new ProgressExperienceError("nutrition failed", "mock"); },
      async getBodyMetrics() { throw new ProgressExperienceError("body failed", "mock"); },
      async getCoachInsights() { throw new ProgressExperienceError("insights failed", "mock"); },
    };
    const viewModel = new ProgressExperienceViewModel({ service: failing });
    await viewModel.loadDashboard();
    expect(viewModel.dashboard).toBeNull();
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores dashboard after a transient error", async () => {
    let calls = 0;
    const service: ProgressExperienceService = {
      providerId: "mock",
      async getDashboard(timeRange) {
        calls += 1;
        if (calls === 1) {
          throw new ProgressExperienceError("transient", "mock");
        }
        return mockProgressExperienceService.getDashboard(timeRange);
      },
      getStrengthProgress: mockProgressExperienceService.getStrengthProgress,
      getVolumeProgress: mockProgressExperienceService.getVolumeProgress,
      getRecoveryProgress: mockProgressExperienceService.getRecoveryProgress,
      getNutritionProgress: mockProgressExperienceService.getNutritionProgress,
      getBodyMetrics: mockProgressExperienceService.getBodyMetrics,
      getCoachInsights: mockProgressExperienceService.getCoachInsights,
    };
    const viewModel = new ProgressExperienceViewModel({ service });
    await viewModel.loadDashboard();
    expect(viewModel.error).not.toBeNull();
    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.loading.isRefreshing).toBe(false);
  });

  it("changes time range and reloads dashboard", async () => {
    const viewModel = new ProgressExperienceViewModel({ service: mockProgressExperienceService });
    await viewModel.loadDashboard();
    const firstHeadline = viewModel.dashboard?.headline;
    await viewModel.changeTimeRange(TimeRanges.LAST_7_DAYS);
    expect(viewModel.timeRange).toBe(TimeRanges.LAST_7_DAYS);
    expect(viewModel.dashboard?.headline).not.toBe(firstHeadline);
  });

  it("reloads section projections independently", async () => {
    const viewModel = new ProgressExperienceViewModel({ service: mockProgressExperienceService });
    await viewModel.loadDashboard();
    await viewModel.loadStrengthProgress();
    await viewModel.loadVolumeProgress();
    await viewModel.loadRecoveryProgress();
    await viewModel.loadNutritionProgress();
    await viewModel.loadBodyMetrics();
    await viewModel.loadCoachInsights();
    expect(viewModel.strength?.estimatedOneRepMaxKg).toBeGreaterThan(0);
    expect(viewModel.volume?.totalVolumeKg).toBeGreaterThan(0);
    expect(viewModel.recovery?.averageScore).toBeGreaterThanOrEqual(0);
    expect(viewModel.nutrition?.proteinAdherencePercent).toBeGreaterThan(0);
    expect(viewModel.bodyMetrics?.bodyWeightKg).toBeGreaterThan(0);
    expect(viewModel.coachInsights.length).toBeGreaterThan(0);
  });

  it("marks empty dashboard states", async () => {
    const viewModel = new ProgressExperienceViewModel({ service: emptyMockProgressExperienceService });
    await viewModel.loadDashboard();
    expect(viewModel.isEmpty).toBe(true);
  });

  it("notifies subscribers on load", async () => {
    const viewModel = new ProgressExperienceViewModel({ service: mockProgressExperienceService });
    const listener = jest.fn();
    viewModel.subscribe(listener);
    await viewModel.loadDashboard();
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("applyHydratedProgress drives runtime dashboard without ProgressExperienceService", async () => {
    const viewModel = new ProgressExperienceViewModel({ athleteId: "athlete-runtime" });
    expect(viewModel.isRuntimeDriven).toBe(true);

    viewModel.applyHydratedProgress(
      mapProgressDashboard(
        mapProgressAnalyticsToExperienceDto({
          analytics: await mockProgressAnalyticsService.getAnalytics(),
          timeRange: TimeRanges.LAST_30_DAYS,
          athleteId: "athlete-runtime",
        }),
      ),
    );

    expect(viewModel.dashboard?.strength.estimatedOneRepMaxKg).toBeGreaterThan(0);
    expect(viewModel.loading.status).toBe(ProgressLoadingStatuses.IDLE);
  });

  it("applyProgressFailure clears dashboard for runtime path", () => {
    const viewModel = new ProgressExperienceViewModel({ athleteId: "athlete-runtime" });
    viewModel.applyProgressFailure("Progress analytics runtime unavailable.");
    expect(viewModel.dashboard).toBeNull();
    expect(viewModel.error?.code).toBe("progress_runtime_unavailable");
  });
});
