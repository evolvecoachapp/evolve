import {
  backendNutritionService,
  createNutritionService,
  mockNutritionService,
} from "..";
import { NutritionServiceError } from "../nutritionService";

describe("nutritionService architecture", () => {
  it("defaults to the mock provider", () => {
    const service = createNutritionService("mock");
    expect(service.providerId).toBe("mock");
  });

  it("returns the seeded nutrition dashboard snapshot", async () => {
    const nutrition = await mockNutritionService.getTodayNutrition();

    expect(nutrition.daily.calories.current).toBe(1840);
    expect(nutrition.daily.calories.target).toBe(2400);
    expect(nutrition.daily.protein.current).toBe(142);
    expect(nutrition.daily.meals).toHaveLength(4);
    expect(nutrition.daily.meals[0].name).toBe("Breakfast — Oatmeal & Eggs");
    expect(nutrition.goal.type).toBe("maintain");
    expect(nutrition.favorites).toHaveLength(2);
    expect(nutrition.recentFoods).toHaveLength(2);
  });

  it("returns a fresh object on each mock fetch", async () => {
    const first = await mockNutritionService.getTodayNutrition();
    const second = await mockNutritionService.getTodayNutrition();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it("searches, updates, and logs food entries", async () => {
    const searchResults = await mockNutritionService.searchFood("chicken");
    expect(searchResults.length).toBeGreaterThan(0);

    const meal = await mockNutritionService.updateMeal({
      mealId: "meal-breakfast",
      time: "7:45 AM",
    });
    expect(meal.time).toBe("7:45 AM");

    const updatedMeal = await mockNutritionService.addFood({
      mealId: "meal-breakfast",
      foodId: "food-chicken",
      servingId: "serving-chicken-4oz",
      servings: 1,
    });
    expect(updatedMeal.entries?.length).toBe(1);

    const history = await mockNutritionService.getHistory();
    expect(history.summaries.length).toBeGreaterThan(0);
  });

  it("throws when an unconfigured provider is invoked", async () => {
    await expect(backendNutritionService.getTodayNutrition()).rejects.toBeInstanceOf(
      NutritionServiceError,
    );
  });
});
