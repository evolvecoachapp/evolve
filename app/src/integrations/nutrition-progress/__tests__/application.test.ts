import {
  getIngestedNutritionProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import {
  publishDailyNutritionCompleted,
  publishHydrationLogged,
  publishMealLogged,
} from "../application";
import { createNutritionProgressIntegration } from "../composition";
import {
  createTestHydration,
  createTestMeal,
  createTestMealEntry,
  createTestNutritionSummary,
  FIXED_PUBLISHED_AT,
} from "../testSupport/fixtures";

describe("nutrition-progress application", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("publishes daily nutrition completion through integration publisher", async () => {
    const { publisher } = createNutritionProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishDailyNutritionCompleted({
      publisher,
      summary: createTestNutritionSummary(),
      correlationId: "corr-complete",
      eventId: "evt-complete",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedNutritionProgressEvents()[0]?.eventType).toBe("DailyNutritionCompleted");
  });

  it("publishes meal logged events", async () => {
    const { publisher } = createNutritionProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishMealLogged({
      publisher,
      entry: createTestMealEntry(),
      meal: createTestMeal(),
      dayId: "2026-08-02",
      correlationId: "corr-meal",
      eventId: "evt-meal",
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedNutritionProgressEvents()[0]?.eventType).toBe("MealLogged");
  });

  it("publishes hydration logged events", async () => {
    const { publisher } = createNutritionProgressIntegration({
      progressAnalyticsService: mockProgressAnalyticsService,
    });

    const result = await publishHydrationLogged({
      publisher,
      hydration: createTestHydration(),
      dayId: "2026-08-02",
      correlationId: "corr-hydration",
      eventId: "evt-hydration",
      loggedAt: FIXED_PUBLISHED_AT,
      publishedAt: FIXED_PUBLISHED_AT,
    });

    expect(result.accepted).toBe(true);
    expect(getIngestedNutritionProgressEvents()[0]?.eventType).toBe("HydrationLogged");
  });
});
