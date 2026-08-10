/** Supported nutrition progress integration event types — represent only. */
export type NutritionProgressEventType =
  | "NutritionDayStarted"
  | "MealLogged"
  | "MealRemoved"
  | "DailyNutritionCompleted"
  | "HydrationLogged"
  | "MacroTargetUpdated"
  | "NutritionGoalAchieved"
  | "NutritionAdherenceUpdated";

export const NUTRITION_PROGRESS_EVENT_TYPES: readonly NutritionProgressEventType[] =
  Object.freeze([
    "NutritionDayStarted",
    "MealLogged",
    "MealRemoved",
    "DailyNutritionCompleted",
    "HydrationLogged",
    "MacroTargetUpdated",
    "NutritionGoalAchieved",
    "NutritionAdherenceUpdated",
  ]);

export function isNutritionProgressEventType(
  value: string,
): value is NutritionProgressEventType {
  return (NUTRITION_PROGRESS_EVENT_TYPES as readonly string[]).includes(value);
}
