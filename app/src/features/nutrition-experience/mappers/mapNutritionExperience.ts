import {
  createDailyCalories,
  createDailyCarbohydrates,
  createDailyFat,
  createDailyProtein,
  createHydrationProgress,
  createMacroProgress,
  createMeal,
  createMealFood,
  createMealSummary,
  createNutritionCoachSuggestion,
  createNutritionDashboard,
  type HydrationProgress,
  type MacroProgress,
  type Meal,
  type NutritionCoachSuggestion,
  type NutritionDashboard,
} from "../models";
import type {
  HydrationProgressDto,
  MacroProgressDto,
  MealDto,
  NutritionCoachSuggestionDto,
  NutritionDashboardDto,
} from "../services";

function percent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

export function mapMacros(dto: MacroProgressDto): MacroProgress {
  return createMacroProgress({
    calories: createDailyCalories({
      current: dto.calories.current,
      target: dto.calories.target,
      remaining: Math.max(0, dto.calories.target - dto.calories.current),
      completionPercent: percent(dto.calories.current, dto.calories.target),
    }),
    protein: createDailyProtein({
      currentGrams: dto.protein.currentGrams,
      targetGrams: dto.protein.targetGrams,
      remainingGrams: Math.max(0, dto.protein.targetGrams - dto.protein.currentGrams),
      completionPercent: percent(dto.protein.currentGrams, dto.protein.targetGrams),
    }),
    carbohydrates: createDailyCarbohydrates({
      currentGrams: dto.carbohydrates.currentGrams,
      targetGrams: dto.carbohydrates.targetGrams,
      remainingGrams: Math.max(0, dto.carbohydrates.targetGrams - dto.carbohydrates.currentGrams),
      completionPercent: percent(dto.carbohydrates.currentGrams, dto.carbohydrates.targetGrams),
    }),
    fat: createDailyFat({
      currentGrams: dto.fat.currentGrams,
      targetGrams: dto.fat.targetGrams,
      remainingGrams: Math.max(0, dto.fat.targetGrams - dto.fat.currentGrams),
      completionPercent: percent(dto.fat.currentGrams, dto.fat.targetGrams),
    }),
    score: dto.score,
  });
}

export function mapHydration(dto: HydrationProgressDto): HydrationProgress {
  return createHydrationProgress({
    currentMl: dto.currentMl,
    goalMl: dto.goalMl,
    remainingMl: Math.max(0, dto.goalMl - dto.currentMl),
    completionPercent: percent(dto.currentMl, dto.goalMl),
    destination: dto.destination ?? "/(app)/nutrition/history",
  });
}

export function mapMeals(meals: readonly MealDto[]): readonly Meal[] {
  return Object.freeze(
    meals.map((meal) =>
      createMeal({
        ...meal,
        destination: meal.destination ?? `/(app)/nutrition/meal/${meal.id}`,
        foods: meal.foods.map((food) => createMealFood(food)),
      }),
    ),
  );
}

export function mapCoachSuggestions(
  suggestions: readonly NutritionCoachSuggestionDto[],
): readonly NutritionCoachSuggestion[] {
  return Object.freeze(
    suggestions.map((suggestion) =>
      createNutritionCoachSuggestion({
        ...suggestion,
        destination: suggestion.destination ?? `/(app)/nutrition/coach/${suggestion.id}`,
      }),
    ),
  );
}

export function mapNutritionDashboard(dto: NutritionDashboardDto): NutritionDashboard {
  return createNutritionDashboard({
    day: dto.day,
    availableDays: dto.availableDays,
    headline: dto.headline,
    summary: dto.summary,
    todaysGoal: dto.todaysGoal,
    nutritionScore: dto.nutritionScore,
    macros: mapMacros(dto.macros),
    hydration: mapHydration(dto.hydration),
    meals: mapMeals(dto.meals),
    mealSummary: createMealSummary(dto.mealSummary),
    coachSuggestions: mapCoachSuggestions(dto.coachSuggestions),
    mealDetailsDestination: dto.mealDetailsDestination ?? "/(app)/nutrition/meal-details",
    foodSearchDestination: dto.foodSearchDestination ?? "/(app)/nutrition/food-search",
    barcodeScannerDestination: dto.barcodeScannerDestination ?? "/(app)/nutrition/barcode-scanner",
    historyDestination: dto.historyDestination ?? "/(app)/nutrition/history",
  });
}
