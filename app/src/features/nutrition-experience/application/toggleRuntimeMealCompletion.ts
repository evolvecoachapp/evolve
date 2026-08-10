import type { Meal } from "../models";
import { createMeal, type NutritionDashboard } from "../models";

function percent(current: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function rebuildMacros(dashboard: NutritionDashboard): NutritionDashboard {
  const completed = dashboard.meals.filter((meal) => meal.isCompleted);
  const currentCalories = completed.reduce((sum, meal) => sum + meal.calories, 0);
  const currentProtein = completed.reduce((sum, meal) => sum + meal.proteinGrams, 0);
  const currentCarbs = completed.reduce(
    (sum, meal) => sum + meal.carbohydratesGrams,
    0,
  );
  const currentFat = completed.reduce((sum, meal) => sum + meal.fatGrams, 0);
  const macros = dashboard.macros;

  return Object.freeze({
    ...dashboard,
    headline: `${currentCalories} of ${macros.calories.target} kcal`,
    macros: Object.freeze({
      ...macros,
      calories: Object.freeze({
        ...macros.calories,
        current: currentCalories,
        remaining: Math.max(0, macros.calories.target - currentCalories),
        completionPercent: percent(currentCalories, macros.calories.target),
      }),
      protein: Object.freeze({
        ...macros.protein,
        currentGrams: currentProtein,
        remainingGrams: Math.max(0, macros.protein.targetGrams - currentProtein),
        completionPercent: percent(currentProtein, macros.protein.targetGrams),
      }),
      carbohydrates: Object.freeze({
        ...macros.carbohydrates,
        currentGrams: currentCarbs,
        remainingGrams: Math.max(
          0,
          macros.carbohydrates.targetGrams - currentCarbs,
        ),
        completionPercent: percent(currentCarbs, macros.carbohydrates.targetGrams),
      }),
      fat: Object.freeze({
        ...macros.fat,
        currentGrams: currentFat,
        remainingGrams: Math.max(0, macros.fat.targetGrams - currentFat),
        completionPercent: percent(currentFat, macros.fat.targetGrams),
      }),
      score: Math.round(
        (percent(currentProtein, macros.protein.targetGrams) +
          percent(currentCarbs, macros.carbohydrates.targetGrams) +
          percent(currentFat, macros.fat.targetGrams)) /
          3,
      ),
    }),
    mealSummary: Object.freeze({
      ...dashboard.mealSummary,
      completedMeals: completed.length,
      completionPercent: percent(completed.length, dashboard.meals.length),
      nextMealLabel:
        dashboard.meals.find((meal) => !meal.isCompleted)?.title ??
        "All meals completed",
    }),
  });
}

export interface ToggleRuntimeMealCompletionInput {
  readonly dashboard: NutritionDashboard;
  readonly mealId: string;
}

export interface ToggleRuntimeMealCompletionResult {
  readonly dashboard: NutritionDashboard;
  readonly meal: Meal | null;
  readonly completed: boolean;
}

/** Toggles meal completion in a runtime-driven nutrition dashboard. */
export function toggleRuntimeMealCompletion(
  input: ToggleRuntimeMealCompletionInput,
): ToggleRuntimeMealCompletionResult {
  const mealIndex = input.dashboard.meals.findIndex((meal) => meal.id === input.mealId);
  if (mealIndex < 0) {
    return Object.freeze({
      dashboard: input.dashboard,
      meal: null,
      completed: false,
    });
  }

  const current = input.dashboard.meals[mealIndex]!;
  const completed = !current.isCompleted;
  const nextMeal = createMeal({
    ...current,
    isCompleted: completed,
    completionPercent: completed ? 100 : 0,
  });

  const meals = Object.freeze(
    input.dashboard.meals.map((meal, index) =>
      index === mealIndex ? nextMeal : meal,
    ),
  );

  const dashboard = rebuildMacros(
    Object.freeze({
      ...input.dashboard,
      meals,
    }),
  );

  return Object.freeze({
    dashboard,
    meal: nextMeal,
    completed,
  });
}
