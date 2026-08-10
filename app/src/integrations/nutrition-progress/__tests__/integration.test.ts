import {
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishDailyNutritionCompleted,
  publishMealLogged,
} from "../application";
import { createNutritionProgressIntegration } from "../composition";
import {
  createTestMeal,
  createTestMealEntry,
  createTestNutritionSummary,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("nutrition-progress integration", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("updates progress analytics read models through contracts only", async () => {
    const baseline = await mockProgressAnalyticsService.getNutritionStatistics();

    const { publisher } = createNutritionProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    await publishDailyNutritionCompleted({
      publisher,
      summary: createTestNutritionSummary(),
      correlationId: "corr-integration",
      eventId: "evt-integration-complete",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    await publishMealLogged({
      publisher,
      entry: createTestMealEntry({ id: "entry-integration" }),
      meal: createTestMeal(),
      dayId: "2026-08-02",
      correlationId: "corr-integration",
      eventId: "evt-integration-meal",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    const stats = await mockProgressAnalyticsService.getNutritionStatistics();

    expect(stats.entries.length).toBe(baseline.entries.length + 2);
    expect(stats.entries.some((entry) => entry.id === "evt-integration-complete")).toBe(true);
    expect(stats.entries.some((entry) => entry.id === "entry-integration")).toBe(true);
  });
});
