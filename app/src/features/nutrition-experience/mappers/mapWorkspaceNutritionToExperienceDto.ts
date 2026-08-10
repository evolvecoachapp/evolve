import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { WorkspaceNutrition } from "../../unified-workspace/models/WorkspaceNutrition";
import type {
  HydrationProgressDto,
  MacroProgressDto,
  MealDto,
  NutritionCoachSuggestionDto,
  NutritionDashboardDto,
} from "../services";
import type { NutritionDay } from "../models";

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

const MEAL_SCHEDULE = Object.freeze([
  { kind: "breakfast" as const, title: "Breakfast", scheduledTime: "07:30" },
  { kind: "morning_snack" as const, title: "Morning Snack", scheduledTime: "10:30" },
  { kind: "lunch" as const, title: "Lunch", scheduledTime: "13:00" },
  { kind: "pre_workout" as const, title: "Pre Workout", scheduledTime: "16:30" },
  { kind: "post_workout" as const, title: "Post Workout", scheduledTime: "19:00" },
  { kind: "dinner" as const, title: "Dinner", scheduledTime: "20:30" },
  { kind: "evening_snack" as const, title: "Evening Snack", scheduledTime: "22:00" },
]);

function inferMealSlot(
  label: string,
  index: number,
): (typeof MEAL_SCHEDULE)[number] {
  const normalized = label.toLowerCase();
  if (normalized.includes("breakfast")) {
    return MEAL_SCHEDULE[0]!;
  }
  if (normalized.includes("lunch")) {
    return MEAL_SCHEDULE[2]!;
  }
  if (normalized.includes("dinner")) {
    return MEAL_SCHEDULE[5]!;
  }
  if (normalized.includes("snack")) {
    return MEAL_SCHEDULE[1]!;
  }
  if (normalized.includes("pre")) {
    return MEAL_SCHEDULE[3]!;
  }
  if (normalized.includes("post")) {
    return MEAL_SCHEDULE[4]!;
  }
  return MEAL_SCHEDULE[index % MEAL_SCHEDULE.length]!;
}

function buildMealsFromPlan(
  plan: NutritionPlan,
  day: NutritionDay,
  toggledMealIds: ReadonlySet<string> = new Set(),
): readonly MealDto[] {
  const distribution = plan.mealDistribution?.distribution ?? [];
  const slotCount = Math.max(
    plan.mealDistribution?.mealsPerDay ?? 0,
    distribution.length,
    1,
  );
  const labels =
    distribution.length > 0
      ? distribution
      : MEAL_SCHEDULE.slice(0, slotCount).map((slot) => slot.title);

  const targetCalories = plan.macroTargets.calories;
  const targetProtein = plan.macroTargets.proteinG;
  const targetCarbs = plan.macroTargets.carbsG;
  const targetFat = plan.macroTargets.fatG;
  const divisor = Math.max(1, labels.length);

  return Object.freeze(
    labels.map((label, index) => {
      const slot = inferMealSlot(label, index);
      const id = `${slot.kind}-${index}`;
      const isCompleted = toggledMealIds.has(id);
      const calories = Math.round(targetCalories / divisor);
      const proteinGrams = Math.round(targetProtein / divisor);
      const carbohydratesGrams = Math.round(targetCarbs / divisor);
      const fatGrams = Math.round(targetFat / divisor);

      return Object.freeze({
        id,
        kind: slot.kind,
        title: label.trim() || slot.title,
        scheduledTime: slot.scheduledTime,
        completionPercent: isCompleted ? 100 : 0,
        isCompleted,
        calories,
        proteinGrams,
        carbohydratesGrams,
        fatGrams,
        foods: Object.freeze([
          Object.freeze({
            id: `${id}-planned`,
            name: label.trim() || slot.title,
            quantity: "1 serving",
            calories,
            proteinGrams,
            carbohydratesGrams,
            fatGrams,
          }),
        ]),
        destination: `/(app)/nutrition/meal-details/${id}`,
      });
    }),
  );
}

function summarizeMeals(meals: readonly MealDto[]) {
  const completedMeals = meals.filter((meal) => meal.isCompleted).length;
  const nextMeal = meals.find((meal) => !meal.isCompleted);
  return Object.freeze({
    totalMeals: meals.length,
    completedMeals,
    completionPercent: percent(completedMeals, meals.length),
    nextMealLabel: nextMeal
      ? `${nextMeal.title} at ${nextMeal.scheduledTime}`
      : "All meals completed",
  });
}

function buildMacros(
  meals: readonly MealDto[],
  targets: {
    readonly calories: number;
    readonly proteinG: number;
    readonly carbsG: number;
    readonly fatG: number;
  },
): MacroProgressDto {
  const completed = meals.filter((meal) => meal.isCompleted);
  const currentCalories = completed.reduce((sum, meal) => sum + meal.calories, 0);
  const currentProtein = completed.reduce((sum, meal) => sum + meal.proteinGrams, 0);
  const currentCarbs = completed.reduce(
    (sum, meal) => sum + meal.carbohydratesGrams,
    0,
  );
  const currentFat = completed.reduce((sum, meal) => sum + meal.fatGrams, 0);

  return Object.freeze({
    calories: Object.freeze({
      current: currentCalories,
      target: targets.calories,
    }),
    protein: Object.freeze({
      currentGrams: currentProtein,
      targetGrams: targets.proteinG,
    }),
    carbohydrates: Object.freeze({
      currentGrams: currentCarbs,
      targetGrams: targets.carbsG,
    }),
    fat: Object.freeze({
      currentGrams: currentFat,
      targetGrams: targets.fatG,
    }),
    score: Math.round(
      (percent(currentProtein, targets.proteinG) +
        percent(currentCarbs, targets.carbsG) +
        percent(currentFat, targets.fatG)) /
        3,
    ),
  });
}

function buildHydration(
  plan: NutritionPlan | null,
  currentMl = 0,
): HydrationProgressDto {
  const goalMl = plan?.hydrationPlan?.litersPerDay
    ? Math.round(plan.hydrationPlan.litersPerDay * 1000)
    : 3200;

  return Object.freeze({
    currentMl,
    goalMl,
    destination: "/(app)/nutrition/history",
  });
}

function buildCoachSuggestions(
  nutrition: WorkspaceNutrition,
  macros: MacroProgressDto,
  hydration: HydrationProgressDto,
  mealSummary: ReturnType<typeof summarizeMeals>,
): readonly NutritionCoachSuggestionDto[] {
  if (!nutrition.present) {
    return Object.freeze([]);
  }

  const suggestions: NutritionCoachSuggestionDto[] = [];

  if (nutrition.phaseHint) {
    suggestions.push(
      Object.freeze({
        id: "phase-hint",
        title: "Current nutrition phase",
        message: `Stay aligned with your ${nutrition.phaseHint} phase targets today.`,
        metric: `${macros.calories.current}/${macros.calories.target} kcal`,
        tone: "positive",
        destination: "/(app)/nutrition/coach/phase-hint",
      }),
    );
  }

  if (hydration.currentMl < hydration.goalMl) {
    suggestions.push(
      Object.freeze({
        id: "water-reminder",
        title: "Drink more water",
        message: "Hydration is trailing your goal. Add one large bottle before your next meal.",
        metric: `${hydration.currentMl} ml`,
        tone: "attention",
        destination: "/(app)/nutrition/coach/water-reminder",
      }),
    );
  }

  if (mealSummary.completedMeals > 0) {
    suggestions.push(
      Object.freeze({
        id: "adherence",
        title: "Meal adherence",
        message: nutrition.summary || "Meals are progressing according to plan.",
        metric: `${mealSummary.completedMeals}/${mealSummary.totalMeals} meals`,
        tone: "celebration",
        destination: "/(app)/nutrition/coach/adherence",
      }),
    );
  }

  return Object.freeze(suggestions);
}

function buildEmptyDashboard(day: NutritionDay): NutritionDashboardDto {
  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: "No nutrition data yet",
    summary: "Start logging meals and hydration to unlock daily nutrition guidance.",
    todaysGoal: "Build your first consistent nutrition day.",
    nutritionScore: 0,
    macros: Object.freeze({
      calories: Object.freeze({ current: 0, target: 0 }),
      protein: Object.freeze({ currentGrams: 0, targetGrams: 0 }),
      carbohydrates: Object.freeze({ currentGrams: 0, targetGrams: 0 }),
      fat: Object.freeze({ currentGrams: 0, targetGrams: 0 }),
      score: 0,
    }),
    hydration: Object.freeze({
      currentMl: 0,
      goalMl: 0,
      destination: "/(app)/nutrition/history",
    }),
    meals: Object.freeze([]),
    mealSummary: Object.freeze({
      totalMeals: 0,
      completedMeals: 0,
      completionPercent: 0,
      nextMealLabel: "No meals planned",
    }),
    coachSuggestions: Object.freeze([]),
    mealDetailsDestination: "/(app)/nutrition/meal-details",
    foodSearchDestination: "/(app)/nutrition/food-search",
    barcodeScannerDestination: "/(app)/nutrition/barcode-scanner",
    historyDestination: "/(app)/nutrition/history",
  });
}

export interface MapWorkspaceNutritionToExperienceDtoInput {
  readonly nutrition: WorkspaceNutrition;
  readonly day: NutritionDay;
  readonly plan?: NutritionPlan | null;
  readonly toggledMealIds?: ReadonlySet<string>;
  readonly hydrationMl?: number;
}

/** Maps hydrated Unified Workspace nutrition into the Nutrition Experience DTO. */
export function mapWorkspaceNutritionToExperienceDto(
  input: MapWorkspaceNutritionToExperienceDtoInput,
): NutritionDashboardDto {
  const { nutrition, day } = input;
  const toggledMealIds = input.toggledMealIds ?? new Set<string>();

  if (!nutrition.present || !nutrition.macros) {
    const empty = buildEmptyDashboard(day);
    if (input.hydrationMl != null && input.hydrationMl > 0) {
      return Object.freeze({
        ...empty,
        hydration: buildHydration(null, input.hydrationMl),
      });
    }
    return empty;
  }

  const targets = nutrition.macros;
  const plan = input.plan ?? null;
  const meals = plan
    ? buildMealsFromPlan(plan, day, toggledMealIds)
    : Object.freeze([] as readonly MealDto[]);
  const mealSummary = summarizeMeals(meals);
  const macros = buildMacros(meals, targets);
  const hydration = buildHydration(plan, input.hydrationMl ?? 0);
  const coachSuggestions = buildCoachSuggestions(
    nutrition,
    macros,
    hydration,
    mealSummary,
  );

  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: `${macros.calories.current} of ${macros.calories.target} kcal`,
    summary:
      nutrition.summary ||
      "Nutrition is framed around training quality, recovery, and adherence.",
    todaysGoal: plan?.phaseHint
      ? `Follow your ${plan.phaseHint} phase targets and meal timing today.`
      : "Fuel training with steady protein and consistent hydration.",
    nutritionScore: Math.round(
      (macros.score +
        mealSummary.completionPercent +
        percent(hydration.currentMl, hydration.goalMl)) /
        3,
    ),
    macros,
    hydration,
    meals,
    mealSummary,
    coachSuggestions,
    mealDetailsDestination: "/(app)/nutrition/meal-details",
    foodSearchDestination: "/(app)/nutrition/food-search",
    barcodeScannerDestination: "/(app)/nutrition/barcode-scanner",
    historyDestination: "/(app)/nutrition/history",
  });
}
