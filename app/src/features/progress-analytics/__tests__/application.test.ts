import {
  loadAnalytics,
  loadAnalyticsSnapshot,
  loadBodyMeasurements,
  loadGoalProgress,
  loadNutritionStatistics,
  loadPersonalRecords,
  loadRecoveryStatistics,
  loadStrengthProgress,
  loadWorkoutHistory,
  refreshAnalytics,
} from "../application";
import {
  emptyMockProgressAnalyticsService,
  mockProgressAnalyticsService,
} from "../providers/MockProgressAnalyticsService";
import type { ProgressAnalyticsService } from "../services";
import { ProgressAnalyticsError } from "../services";

function createFailingService(): ProgressAnalyticsService {
  return {
    providerId: "mock",
    async getAnalytics() { throw new ProgressAnalyticsError("load failed", "mock"); },
    async getWorkoutHistory() { throw new ProgressAnalyticsError("history failed", "mock"); },
    async getBodyMeasurements() { throw new ProgressAnalyticsError("measurements failed", "mock"); },
    async getStrengthProgress() { throw new ProgressAnalyticsError("strength failed", "mock"); },
    async getNutritionStatistics() { throw new ProgressAnalyticsError("nutrition failed", "mock"); },
    async getRecoveryStatistics() { throw new ProgressAnalyticsError("recovery failed", "mock"); },
    async getGoalProgress() { throw new ProgressAnalyticsError("goals failed", "mock"); },
    async getPersonalRecords() { throw new ProgressAnalyticsError("records failed", "mock"); },
    async getAnalyticsSnapshot() { throw new ProgressAnalyticsError("snapshot failed", "mock"); },
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
}

describe("progress-analytics application APIs", () => {
  it("loads analytics with immutable data", async () => {
    const data = await loadAnalytics({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(data)).toBe(true);
    expect(Object.isFrozen(data.summary)).toBe(true);
    expect(data.summary.workoutsCompleted).toBeGreaterThan(0);
  });

  it("refresh returns fresh mapped data", async () => {
    const first = await loadAnalytics({ service: mockProgressAnalyticsService });
    const second = await refreshAnalytics({ service: mockProgressAnalyticsService });
    expect(second).not.toBe(first);
    expect(second.summary.workoutsCompleted).toBe(first.summary.workoutsCompleted);
  });

  it("loads workout history", async () => {
    const history = await loadWorkoutHistory({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(history)).toBe(true);
    expect(history.entries.length).toBeGreaterThan(0);
  });

  it("loads body measurements", async () => {
    const measurements = await loadBodyMeasurements({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(measurements)).toBe(true);
    expect(measurements.length).toBeGreaterThan(0);
  });

  it("loads strength progress", async () => {
    const progress = await loadStrengthProgress({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(progress)).toBe(true);
    expect(progress.estimatedOneRepMaxKg).toBeGreaterThan(0);
  });

  it("loads nutrition statistics", async () => {
    const stats = await loadNutritionStatistics({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(stats)).toBe(true);
    expect(stats.averageCalories).toBeGreaterThan(0);
  });

  it("loads recovery statistics", async () => {
    const stats = await loadRecoveryStatistics({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(stats)).toBe(true);
    expect(stats.averageScore).toBeGreaterThan(0);
  });

  it("loads goal progress", async () => {
    const goals = await loadGoalProgress({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(goals)).toBe(true);
    expect(goals.length).toBeGreaterThan(0);
  });

  it("loads personal records", async () => {
    const records = await loadPersonalRecords({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);
  });

  it("loads analytics snapshot", async () => {
    const snapshot = await loadAnalyticsSnapshot({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(snapshot.id).toBeTruthy();
  });

  it("supports empty analytics state", async () => {
    const data = await loadAnalytics({ service: emptyMockProgressAnalyticsService });
    expect(data.summary.workoutsCompleted).toBe(0);
    expect(data.workoutHistory.entries.length).toBe(0);
  });

  it("propagates provider failures", async () => {
    await expect(loadAnalytics({ service: createFailingService() })).rejects.toThrow("load failed");
  });
});
