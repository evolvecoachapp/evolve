import {
  getIngestedNutritionProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { NutritionProgressSubscriber } from "../subscribers";
import { createTestNutritionProgressEvent } from "../testSupport/fixtures";

describe("NutritionProgressSubscriber", () => {
  beforeEach(() => {
    resetMockProgressAnalyticsData();
  });

  it("forwards mapped events through ProgressAnalyticsService contract", async () => {
    const subscriber = new NutritionProgressSubscriber(mockProgressAnalyticsService);
    const event = createTestNutritionProgressEvent({
      type: "MealLogged",
      payload: Object.freeze({
        ...createTestNutritionProgressEvent().payload,
        mealId: "meal-001",
        mealName: "Lunch",
        calories: 650,
        proteinGrams: 45,
        completedAt: "2026-08-02T12:30:00.000Z",
      }),
    });

    const result = await subscriber.onEvent(event);

    expect(result.accepted).toBe(true);
    expect(getIngestedNutritionProgressEvents()).toHaveLength(1);
    expect(getIngestedNutritionProgressEvents()[0]?.eventType).toBe("MealLogged");
  });
});
