import type { DailyNutrition } from "./DailyNutrition";
import type { FavoriteFood } from "./FavoriteFood";
import type { NutritionGoal } from "./NutritionGoal";
import type { NutritionSummary } from "./NutritionSummary";
import type { RecentFood } from "./RecentFood";

/** Primary read model for the Nutrition tab screen. */
export interface NutritionDashboard {
  daily: DailyNutrition;
  goal: NutritionGoal;
  summary: NutritionSummary;
  favorites: FavoriteFood[];
  recentFoods: RecentFood[];
}
