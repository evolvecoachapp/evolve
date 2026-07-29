import { backendProgressAnalyticsService } from "../providers/BackendProgressAnalyticsService";
import { localProgressAnalyticsService } from "../providers/LocalProgressAnalyticsService";
import {
  emptyMockProgressAnalyticsService,
  mockProgressAnalyticsService,
} from "../providers/MockProgressAnalyticsService";

describe("progress-analytics providers", () => {
  it("mock provider returns data", async () => {
    const data = await mockProgressAnalyticsService.getAnalytics();
    expect(data.summary.workoutsCompleted).toBeGreaterThan(0);
    expect(data.workoutHistory.entries.length).toBeGreaterThan(0);
  });

  it("empty mock provider returns empty collections", async () => {
    const data = await emptyMockProgressAnalyticsService.getAnalytics();
    expect(data.summary.workoutsCompleted).toBe(0);
    expect(data.goalProgress.length).toBe(0);
  });

  it("backend provider throws", async () => {
    await expect(backendProgressAnalyticsService.getAnalytics()).rejects.toThrow("Backend");
  });

  it("local provider throws", async () => {
    await expect(localProgressAnalyticsService.getAnalytics()).rejects.toThrow("Local");
  });

  it("mock provider returns strength progress", async () => {
    const progress = await mockProgressAnalyticsService.getStrengthProgress();
    expect(progress.estimatedOneRepMaxKg).toBeGreaterThan(0);
  });

  it("mock provider returns snapshot", async () => {
    const snapshot = await mockProgressAnalyticsService.getAnalyticsSnapshot();
    expect(snapshot.id).toBeTruthy();
  });
});
