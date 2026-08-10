import { AnalyticsLoadingStatuses } from "../models";
import {
  emptyMockProgressAnalyticsService,
  mockProgressAnalyticsService,
} from "../providers/MockProgressAnalyticsService";
import type { ProgressAnalyticsService } from "../services";
import { ProgressAnalyticsError } from "../services";
import { ProgressAnalyticsViewModel } from "../viewmodels";

describe("ProgressAnalyticsViewModel", () => {
  it("loads analytics", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    expect(viewModel.loading.status).toBe(AnalyticsLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.summary).not.toBeNull();
  });

  it("exposes error state when provider fails", async () => {
    const failing: ProgressAnalyticsService = {
      providerId: "mock",
      async getAnalytics() { throw new ProgressAnalyticsError("load failed", "mock"); },
      async getWorkoutHistory() { throw new ProgressAnalyticsError("fail", "mock"); },
      async getBodyMeasurements() { throw new ProgressAnalyticsError("fail", "mock"); },
      async getStrengthProgress() { throw new ProgressAnalyticsError("fail", "mock"); },
      async getNutritionStatistics() { throw new ProgressAnalyticsError("fail", "mock"); },
      async getRecoveryStatistics() { throw new ProgressAnalyticsError("fail", "mock"); },
      async getGoalProgress() { throw new ProgressAnalyticsError("fail", "mock"); },
      async getPersonalRecords() { throw new ProgressAnalyticsError("fail", "mock"); },
      async getAnalyticsSnapshot() { throw new ProgressAnalyticsError("fail", "mock"); },
      async applyWorkoutProgressEvent() {
        return Object.freeze({
          eventId: "evt-fail",
          accepted: false,
          appliedAt: "2026-07-29T00:00:00Z",
        });
      },
      async applyNutritionProgressEvent() {
        return Object.freeze({
          eventId: "evt-fail",
          accepted: false,
          appliedAt: "2026-07-29T00:00:00Z",
        });
      },
    };
    const viewModel = new ProgressAnalyticsViewModel({ service: failing });
    await viewModel.loadAnalytics();
    expect(viewModel.summary).toBeNull();
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores after a transient error", async () => {
    let calls = 0;
    const service: ProgressAnalyticsService = {
      providerId: "mock",
      async getAnalytics() {
        calls += 1;
        if (calls === 1) throw new ProgressAnalyticsError("transient", "mock");
        return mockProgressAnalyticsService.getAnalytics();
      },
      getWorkoutHistory: mockProgressAnalyticsService.getWorkoutHistory,
      getBodyMeasurements: mockProgressAnalyticsService.getBodyMeasurements,
      getStrengthProgress: mockProgressAnalyticsService.getStrengthProgress,
      getNutritionStatistics: mockProgressAnalyticsService.getNutritionStatistics,
      getRecoveryStatistics: mockProgressAnalyticsService.getRecoveryStatistics,
      getGoalProgress: mockProgressAnalyticsService.getGoalProgress,
      getPersonalRecords: mockProgressAnalyticsService.getPersonalRecords,
      getAnalyticsSnapshot: mockProgressAnalyticsService.getAnalyticsSnapshot,
      applyWorkoutProgressEvent: mockProgressAnalyticsService.applyWorkoutProgressEvent,
      applyNutritionProgressEvent: mockProgressAnalyticsService.applyNutritionProgressEvent,
    };
    const viewModel = new ProgressAnalyticsViewModel({ service });
    await viewModel.loadAnalytics();
    expect(viewModel.error).not.toBeNull();
    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.summary).not.toBeNull();
  });

  it("marks empty state", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: emptyMockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    expect(viewModel.isEmpty).toBe(true);
  });

  it("notifies subscribers on load", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    const listener = jest.fn();
    viewModel.subscribe(listener);
    await viewModel.loadAnalytics();
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("loads specialized slices", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    await viewModel.loadStrengthProgress();
    await viewModel.loadGoalProgress();
    await viewModel.loadAnalyticsSnapshot();
    expect(viewModel.strengthProgress).not.toBeNull();
    expect(viewModel.goalProgress.length).toBeGreaterThan(0);
    expect(viewModel.snapshot).not.toBeNull();
  });
});
