import { mapPayloadToProgressAnalyticsDto } from "../mappers/mapPayloadToProgressAnalyticsDto";
import {
  mapDailyNutritionToStartedPayload,
  mapHydrationToLoggedPayload,
  mapMealEntryToLoggedPayload,
  mapNutritionSummaryToCompletionPayload,
} from "../mappers/mapNutritionDomainToAnalyticsPayload";
import {
  createTestDailyNutrition,
  createTestHydration,
  createTestMeal,
  createTestMealEntry,
  createTestNutritionProgressEvent,
  createTestNutritionSummary,
} from "../testSupport/fixtures";

describe("nutrition-progress mappers", () => {
  it("maps daily nutrition to started payload", () => {
    const payload = mapDailyNutritionToStartedPayload(createTestDailyNutrition());
    expect(Object.isFrozen(payload)).toBe(true);
    expect(payload.dayId).toBe("2026-08-02");
    expect(payload.calories).toBe(1800);
  });

  it("maps nutrition summary to completion payload", () => {
    const payload = mapNutritionSummaryToCompletionPayload(createTestNutritionSummary());
    expect(payload.calories).toBe(2450);
    expect(payload.mealsLogged).toBe(4);
  });

  it("maps meal entry to logged payload", () => {
    const payload = mapMealEntryToLoggedPayload(
      createTestMealEntry(),
      createTestMeal(),
      "2026-08-02",
    );
    expect(payload.foodName).toBe("Chicken Breast");
    expect(payload.calories).toBe(165);
  });

  it("maps hydration to logged payload", () => {
    const payload = mapHydrationToLoggedPayload(
      createTestHydration(),
      "2026-08-02",
      "2026-08-02T18:00:00.000Z",
    );
    expect(payload.hydrationMl).toBe(2200);
    expect(payload.targetHydrationMl).toBe(2500);
  });

  it("maps integration event to progress analytics DTO", () => {
    const dto = mapPayloadToProgressAnalyticsDto(createTestNutritionProgressEvent());
    expect(Object.isFrozen(dto)).toBe(true);
    expect(dto.eventId).toBe("evt-001");
    expect(dto.metadata.source).toBe("nutrition");
    expect(Object.isFrozen(dto.payload.metrics)).toBe(true);
  });
});
