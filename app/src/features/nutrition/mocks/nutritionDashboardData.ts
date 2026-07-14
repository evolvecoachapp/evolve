import type { NutritionDashboard } from "../models/NutritionDashboard";
import { mockFoodCatalog } from "./foodCatalog";

const TODAY = "2026-07-14";

export const mockNutritionDashboardData: NutritionDashboard = {
  daily: {
    date: TODAY,
    calories: { current: 1840, target: 2400 },
    protein: { current: 142, target: 180 },
    carbs: { current: 198, target: 280 },
    fat: { current: 58, target: 75 },
    meals: [
      {
        id: "meal-breakfast",
        name: "Breakfast — Oatmeal & Eggs",
        time: "7:30 AM",
        calories: 520,
        proteinGrams: 32,
      },
      {
        id: "meal-lunch",
        name: "Lunch — Chicken & Rice Bowl",
        time: "12:30 PM",
        calories: 680,
        proteinGrams: 52,
      },
      {
        id: "meal-snack",
        name: "Snack — Greek Yogurt & Berries",
        time: "3:30 PM",
        calories: 240,
        proteinGrams: 24,
      },
      {
        id: "meal-dinner",
        name: "Dinner — Salmon & Vegetables",
        time: "7:00 PM",
        calories: 400,
        proteinGrams: 34,
      },
    ],
    hydration: {
      currentMl: 1800,
      targetMl: 2500,
    },
    status: {
      status: "on_track",
      completionPercent: 77,
    },
  },
  goal: {
    id: "goal-maintain-2400",
    type: "maintain",
    calorieTarget: 2400,
    macroTargets: {
      calories: 2400,
      protein: 180,
      carbs: 280,
      fat: 75,
    },
  },
  summary: {
    date: TODAY,
    totalCalories: 1840,
    calories: { current: 1840, target: 2400 },
    protein: { current: 142, target: 180 },
    carbs: { current: 198, target: 280 },
    fat: { current: 58, target: 75 },
    mealsLogged: 4,
  },
  favorites: [
    {
      id: "favorite-chicken",
      foodId: "food-chicken",
      food: mockFoodCatalog[2],
      addedAt: "2026-07-01T08:00:00.000Z",
    },
    {
      id: "favorite-yogurt",
      foodId: "food-yogurt",
      food: mockFoodCatalog[4],
      addedAt: "2026-07-05T12:00:00.000Z",
    },
  ],
  recentFoods: [
    {
      id: "recent-oatmeal",
      foodId: "food-oatmeal",
      food: mockFoodCatalog[0],
      lastUsedAt: "2026-07-14T07:30:00.000Z",
    },
    {
      id: "recent-salmon",
      foodId: "food-salmon",
      food: mockFoodCatalog[5],
      lastUsedAt: "2026-07-13T19:00:00.000Z",
    },
  ],
};
