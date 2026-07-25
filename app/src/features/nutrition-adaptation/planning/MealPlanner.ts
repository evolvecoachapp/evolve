import { uniqueSorted } from "../utils/NutritionAdaptationHelpers";

export interface MealPlan {
  readonly id: string;
  readonly stepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly mealKeys: readonly string[];
}

export function planMeals(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly mealKeys: readonly string[];
}): MealPlan {
  const relevant = input.decisionKeys.filter(
    (k) => k.includes("meal") || k.includes("calorie") || k.includes("macro") || k.includes("timing"),
  );
  return Object.freeze({
    id: `plan:meal:${input.id}`,
    stepKeys: uniqueSorted(relevant.map((k) => `step:meal:${k}`)),
    targetKeys: uniqueSorted(input.mealKeys.map((k) => `target:${k}`)),
    mealKeys: uniqueSorted(input.mealKeys),
  });
}
