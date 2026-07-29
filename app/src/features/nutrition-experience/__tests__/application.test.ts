import {
  loadCoachSuggestions,
  loadHydration,
  loadMacros,
  loadMeals,
  loadNutritionDashboard,
  refreshNutritionDashboard,
  toggleMealCompletion,
} from "../application";
import { createNutritionDay } from "../models";
import { emptyMockNutritionExperienceService, mockNutritionExperienceService } from "../providers/MockNutritionExperienceService";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceError } from "../services";

const TODAY = createNutritionDay({
  id: "today",
  isoDate: "2026-07-29",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

function createFailingService(): NutritionExperienceService {
  return {
    providerId: "mock",
    async getDashboard() { throw new NutritionExperienceError("dashboard failed", "mock"); },
    async getMeals() { throw new NutritionExperienceError("meals failed", "mock"); },
    async getMacros() { throw new NutritionExperienceError("macros failed", "mock"); },
    async getHydration() { throw new NutritionExperienceError("hydration failed", "mock"); },
    async getCoachSuggestions() { throw new NutritionExperienceError("coach failed", "mock"); },
    async toggleMealCompletion() { throw new NutritionExperienceError("toggle failed", "mock"); },
  };
}

describe("nutrition-experience application APIs", () => {
  it("loads a full immutable dashboard", async () => {
    const dashboard = await loadNutritionDashboard({ service: mockNutritionExperienceService, day: TODAY });
    expect(Object.isFrozen(dashboard)).toBe(true);
    expect(dashboard.meals.length).toBeGreaterThan(0);
    expect(dashboard.coachSuggestions.length).toBeGreaterThan(0);
    expect(dashboard.macros.protein.targetGrams).toBeGreaterThan(0);
  });

  it("refresh returns a fresh mapped dashboard", async () => {
    const first = await loadNutritionDashboard({ service: mockNutritionExperienceService, day: TODAY });
    const second = await refreshNutritionDashboard({ service: mockNutritionExperienceService, day: TODAY });
    expect(second).not.toBe(first);
    expect(second.day.isoDate).toBe(first.day.isoDate);
  });

  it("loads meals, hydration, macros, and coach suggestions", async () => {
    const meals = await loadMeals({ service: mockNutritionExperienceService, day: TODAY });
    const macros = await loadMacros({ service: mockNutritionExperienceService, day: TODAY });
    const hydration = await loadHydration({ service: mockNutritionExperienceService, day: TODAY });
    const suggestions = await loadCoachSuggestions({ service: mockNutritionExperienceService, day: TODAY });
    expect(meals.length).toBeGreaterThan(0);
    expect(macros.calories.target).toBeGreaterThan(0);
    expect(hydration.goalMl).toBeGreaterThan(0);
    expect(suggestions[0]?.title).toContain("carbohydrates");
  });

  it("toggles meal completion through the application layer", async () => {
    const meals = await toggleMealCompletion({
      service: mockNutritionExperienceService,
      day: TODAY,
      mealId: "lunch",
    });
    expect(meals.find((meal) => meal.id === "lunch")?.isCompleted).toBe(true);
  });

  it("supports empty dashboard states", async () => {
    const dashboard = await loadNutritionDashboard({ service: emptyMockNutritionExperienceService, day: TODAY });
    expect(dashboard.meals.length).toBe(0);
    expect(dashboard.coachSuggestions.length).toBe(0);
  });

  it("propagates provider failures", async () => {
    await expect(loadNutritionDashboard({ service: createFailingService(), day: TODAY })).rejects.toThrow("dashboard failed");
  });
});
