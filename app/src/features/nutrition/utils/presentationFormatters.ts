import type { Ionicons } from "@expo/vector-icons";

type MealIconName = keyof typeof Ionicons.glyphMap;

/** Clamped macro completion percentage (0–100). */
export function formatMacroProgress(current: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.min(Math.round((current / target) * 100), 100);
}

/** Calories remaining until the daily target is reached. */
export function formatRemainingCalories(current: number, target: number): number {
  return Math.max(target - current, 0);
}

/** Locale-aware calorie label, e.g. "1,840 kcal". */
export function formatCalorieLabel(value: number): string {
  return `${value.toLocaleString("en-US")} kcal`;
}

/** Macro gram label, e.g. "142g". */
export function formatMacroGrams(value: number): string {
  return `${value}g`;
}

/** Compact completion label for chips and captions. */
export function formatCompletionPercent(progress: number): string {
  return `${progress}%`;
}

/** Long-form date for the nutrition hero overline. */
export function formatNutritionDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Infer a meal-type icon from the meal template name prefix. */
export function resolveMealIcon(mealName: string): MealIconName {
  const normalized = mealName.toLowerCase();

  if (normalized.startsWith("breakfast")) {
    return "sunny-outline";
  }
  if (normalized.startsWith("lunch")) {
    return "restaurant-outline";
  }
  if (normalized.startsWith("dinner")) {
    return "moon-outline";
  }
  if (normalized.startsWith("snack")) {
    return "cafe-outline";
  }
  if (normalized.includes("pre-workout") || normalized.includes("pre workout")) {
    return "flash-outline";
  }
  if (normalized.includes("post-workout") || normalized.includes("post workout")) {
    return "fitness-outline";
  }

  return "nutrition-outline";
}
