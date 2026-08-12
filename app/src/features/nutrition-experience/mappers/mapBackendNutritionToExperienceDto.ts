import { toNumberOrNull } from "../../shared/utils/userAdapters";
import type {
  DailyNutritionReadDto,
  MealLogReadDto,
  MealTypeDto,
} from "../../../types/api";
import type { NutritionDay } from "../models";
import type {
  HydrationProgressDto,
  MacroProgressDto,
  MealDto,
  MealSummaryDto,
  NutritionCoachSuggestionDto,
  NutritionDashboardDto,
} from "../services";

/**
 * Maps Nutrition API DTOs (`src/types/api.ts`) onto the Nutrition Experience
 * read model. Counterpart to the Profile Experience's
 * `mapUserPublicToProfileDto` — only projects fields the backend actually
 * returns. Hydration and coach-suggestion domains have no Nutrition API
 * surface and stay empty placeholders rather than invented values.
 */

function toMacroNumber(value: string | number | null | undefined): number {
  return toNumberOrNull(value) ?? 0;
}

function percent(current: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function buildAvailableDays(base: NutritionDay): readonly NutritionDay[] {
  return Object.freeze([
    Object.freeze({
      ...base,
      id: `${base.isoDate}-minus-1`,
      label: "Yesterday",
      shortLabel: "Yday",
      relativeLabel: "Yesterday",
      isToday: false,
    }),
    Object.freeze({ ...base }),
    Object.freeze({
      ...base,
      id: `${base.isoDate}-plus-1`,
      label: "Tomorrow",
      shortLabel: "Tom",
      relativeLabel: "Tomorrow",
      isToday: false,
    }),
  ]);
}

/** Maps backend `MealType` onto the closed Nutrition Experience meal kind union. */
export function mapMealTypeToKind(mealType: MealTypeDto): MealDto["kind"] {
  switch (mealType) {
    case "breakfast":
      return "breakfast";
    case "lunch":
      return "lunch";
    case "dinner":
      return "dinner";
    case "pre_workout":
      return "pre_workout";
    case "post_workout":
      return "post_workout";
    case "snack":
      return "custom";
    case "other":
    default:
      return "custom";
  }
}

function formatScheduledTime(consumedAt: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(consumedAt);
  if (!match) {
    return "--:--";
  }
  return `${match[1]}:${match[2]}`;
}

function titleFromMealType(mealType: MealTypeDto, nameSnapshot: string): string {
  const trimmed = nameSnapshot.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  switch (mealType) {
    case "breakfast":
      return "Breakfast";
    case "lunch":
      return "Lunch";
    case "dinner":
      return "Dinner";
    case "pre_workout":
      return "Pre Workout";
    case "post_workout":
      return "Post Workout";
    case "snack":
      return "Snack";
    default:
      return "Meal";
  }
}

/** Maps a single `MealLogRead` diary entry onto a Nutrition Experience `MealDto`. */
export function mapMealLogToMealDto(log: MealLogReadDto): MealDto {
  const calories = toMacroNumber(log.calories);
  const proteinGrams = toMacroNumber(log.protein_g);
  const carbohydratesGrams = toMacroNumber(log.carbs_g);
  const fatGrams = toMacroNumber(log.fat_g);
  const kind = mapMealTypeToKind(log.meal_type);
  const title = titleFromMealType(log.meal_type, log.name_snapshot);

  return Object.freeze({
    id: log.id,
    kind,
    title,
    scheduledTime: formatScheduledTime(log.consumed_at),
    // A meal log is a consumed diary entry — treat it as completed.
    completionPercent: 100,
    isCompleted: true,
    calories,
    proteinGrams,
    carbohydratesGrams,
    fatGrams,
    foods: Object.freeze([
      Object.freeze({
        id: `${log.id}-logged`,
        name: title,
        quantity: "1 serving",
        calories,
        proteinGrams,
        carbohydratesGrams,
        fatGrams,
      }),
    ]),
    destination: `/(app)/nutrition/meal-details/${log.id}`,
  });
}

/** Maps a day's meal logs (chronological) onto Nutrition Experience meals. */
export function mapMealLogsToMealDtos(logs: readonly MealLogReadDto[]): readonly MealDto[] {
  const chronological = [...logs].sort((a, b) =>
    a.consumed_at.localeCompare(b.consumed_at),
  );
  return Object.freeze(chronological.map(mapMealLogToMealDto));
}

function summarizeMeals(meals: readonly MealDto[]): MealSummaryDto {
  const completedMeals = meals.filter((meal) => meal.isCompleted).length;
  const nextMeal = meals.find((meal) => !meal.isCompleted);
  return Object.freeze({
    totalMeals: meals.length,
    completedMeals,
    completionPercent: percent(completedMeals, meals.length),
    nextMealLabel: nextMeal
      ? `${nextMeal.title} at ${nextMeal.scheduledTime}`
      : meals.length > 0
        ? "All meals logged"
        : "No meals logged",
  });
}

/** Maps `DailyNutritionRead` targets/actual onto `MacroProgressDto`. */
export function mapDailyNutritionToMacroProgress(
  daily: DailyNutritionReadDto,
): MacroProgressDto {
  const currentCalories = toMacroNumber(daily.actual.calories);
  const targetCalories = toMacroNumber(daily.targets.calories);
  const currentProtein = toMacroNumber(daily.actual.protein_g);
  const targetProtein = toMacroNumber(daily.targets.protein_g);
  const currentCarbs = toMacroNumber(daily.actual.carbs_g);
  const targetCarbs = toMacroNumber(daily.targets.carbs_g);
  const currentFat = toMacroNumber(daily.actual.fat_g);
  const targetFat = toMacroNumber(daily.targets.fat_g);

  return Object.freeze({
    calories: Object.freeze({
      current: currentCalories,
      target: targetCalories,
    }),
    protein: Object.freeze({
      currentGrams: currentProtein,
      targetGrams: targetProtein,
    }),
    carbohydrates: Object.freeze({
      currentGrams: currentCarbs,
      targetGrams: targetCarbs,
    }),
    fat: Object.freeze({
      currentGrams: currentFat,
      targetGrams: targetFat,
    }),
    score: Math.round(
      (percent(currentProtein, targetProtein) +
        percent(currentCarbs, targetCarbs) +
        percent(currentFat, targetFat)) /
        3,
    ),
  });
}

function emptyHydration(): HydrationProgressDto {
  return Object.freeze({
    currentMl: 0,
    goalMl: 0,
    destination: "/(app)/nutrition/history",
  });
}

function emptyCoachSuggestions(): readonly NutritionCoachSuggestionDto[] {
  return Object.freeze([]);
}

export interface MapBackendNutritionToDashboardInput {
  readonly day: NutritionDay;
  readonly daily: DailyNutritionReadDto;
  readonly logs: readonly MealLogReadDto[];
}

/** Assembles the Nutrition Experience dashboard from targets + meal logs. */
export function mapBackendNutritionToDashboard(
  input: MapBackendNutritionToDashboardInput,
): NutritionDashboardDto {
  const { day, daily, logs } = input;
  const meals = mapMealLogsToMealDtos(logs);
  const mealSummary = summarizeMeals(meals);
  const macros = mapDailyNutritionToMacroProgress(daily);
  const hydration = emptyHydration();

  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: `${macros.calories.current} of ${macros.calories.target} kcal`,
    summary: daily.summary_text,
    todaysGoal: "Hit your calorie and macro targets with consistent meal logging.",
    nutritionScore: Math.round(
      (macros.score + mealSummary.completionPercent) / 2,
    ),
    macros,
    hydration,
    meals,
    mealSummary,
    coachSuggestions: emptyCoachSuggestions(),
    mealDetailsDestination: "/(app)/nutrition/meal-details",
    foodSearchDestination: "/(app)/nutrition/food-search",
    barcodeScannerDestination: "/(app)/nutrition/barcode-scanner",
    historyDestination: "/(app)/nutrition/history",
  });
}
