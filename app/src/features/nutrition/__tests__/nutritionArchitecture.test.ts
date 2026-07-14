import { mockNutritionDashboardData } from "../mocks";
import { mockNutritionService } from "../providers/MockNutritionService";

describe("nutrition architecture", () => {
  it("exposes the same macro values as the legacy nutrition mock", async () => {
    const nutrition = await mockNutritionService.getTodayNutrition();

    expect(nutrition.daily.calories).toEqual(mockNutritionDashboardData.daily.calories);
    expect(nutrition.daily.protein).toEqual(mockNutritionDashboardData.daily.protein);
    expect(nutrition.daily.carbs).toEqual(mockNutritionDashboardData.daily.carbs);
    expect(nutrition.daily.fat).toEqual(mockNutritionDashboardData.daily.fat);
    expect(nutrition.daily.meals).toHaveLength(mockNutritionDashboardData.daily.meals.length);
    expect(nutrition.daily.meals.map((meal) => meal.name)).toEqual(
      mockNutritionDashboardData.daily.meals.map((meal) => meal.name),
    );
  });
});
