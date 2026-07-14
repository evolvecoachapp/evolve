import type { NutritionHistory } from "../models/NutritionHistory";

export const mockNutritionHistoryData: NutritionHistory = {
  summaries: [
    {
      date: "2026-07-13",
      totalCalories: 2280,
      calories: { current: 2280, target: 2400 },
      protein: { current: 168, target: 180 },
      carbs: { current: 252, target: 280 },
      fat: { current: 71, target: 75 },
      mealsLogged: 4,
    },
    {
      date: "2026-07-12",
      totalCalories: 2150,
      calories: { current: 2150, target: 2400 },
      protein: { current: 155, target: 180 },
      carbs: { current: 240, target: 280 },
      fat: { current: 65, target: 75 },
      mealsLogged: 4,
    },
    {
      date: "2026-07-11",
      totalCalories: 2390,
      calories: { current: 2390, target: 2400 },
      protein: { current: 178, target: 180 },
      carbs: { current: 275, target: 280 },
      fat: { current: 74, target: 75 },
      mealsLogged: 5,
    },
  ],
};
