import type { MealDistribution } from "../models/MealDistribution";

export function defaultMealSlots(mealsPerDay: number): readonly string[] {
  if (mealsPerDay <= 2) return Object.freeze(["meal_1", "meal_2"]);
  if (mealsPerDay === 3)
    return Object.freeze(["breakfast", "lunch", "dinner"]);
  if (mealsPerDay === 4)
    return Object.freeze(["breakfast", "lunch", "snack", "dinner"]);
  return Object.freeze([
    "breakfast",
    "snack_am",
    "lunch",
    "snack_pm",
    "dinner",
  ]);
}

export function buildMealDistribution(
  mealsPerDay: number,
): MealDistribution {
  const n = Math.min(6, Math.max(2, Math.round(mealsPerDay)));
  return Object.freeze({
    mealsPerDay: n,
    distribution: defaultMealSlots(n),
  });
}
