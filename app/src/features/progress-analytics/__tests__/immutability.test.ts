import { loadAnalytics } from "../application";
import { mockProgressAnalyticsService } from "../providers/MockProgressAnalyticsService";

describe("progress-analytics immutability", () => {
  it("analytics data is frozen", async () => {
    const data = await loadAnalytics({ service: mockProgressAnalyticsService });
    expect(Object.isFrozen(data)).toBe(true);
    expect(Object.isFrozen(data.summary)).toBe(true);
    expect(Object.isFrozen(data.filter)).toBe(true);
    expect(Object.isFrozen(data.filter.categories)).toBe(true);
    expect(Object.isFrozen(data.workoutHistory)).toBe(true);
    expect(Object.isFrozen(data.workoutHistory.entries)).toBe(true);
    expect(Object.isFrozen(data.bodyMeasurements)).toBe(true);
    expect(Object.isFrozen(data.goalProgress)).toBe(true);
    expect(Object.isFrozen(data.personalRecords)).toBe(true);
    expect(Object.isFrozen(data.charts)).toBe(true);
  });

  it("charts and nested points are frozen", async () => {
    const data = await loadAnalytics({ service: mockProgressAnalyticsService });
    for (const chart of data.charts) {
      expect(Object.isFrozen(chart)).toBe(true);
      expect(Object.isFrozen(chart.points)).toBe(true);
      expect(Object.isFrozen(chart.series)).toBe(true);
    }
  });

  it("snapshot is frozen when present", async () => {
    const data = await loadAnalytics({ service: mockProgressAnalyticsService });
    expect(data.snapshot).not.toBeNull();
    expect(Object.isFrozen(data.snapshot)).toBe(true);
    expect(Object.isFrozen(data.snapshot!.period)).toBe(true);
    expect(Object.isFrozen(data.snapshot!.summary)).toBe(true);
  });
});
