import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { Meal as DomainMeal } from "../../nutrition/models/Meal";
import type { MealEntry } from "../../nutrition/models/MealEntry";
import {
  publishDailyNutritionCompleted,
  publishHydrationLogged,
  publishMealLogged,
  publishNutritionProgress,
} from "../../../integrations/nutrition-progress/application";
import {
  createNutritionProgressEvent,
  createNutritionProgressMetadata,
} from "../../../integrations/nutrition-progress/models";
import type { Meal } from "../models";
import type { NutritionDashboard } from "../models";

function mapExperienceMealToDomain(meal: Meal, dayId: string): DomainMeal {
  return {
    id: meal.id,
    name: meal.title,
    time: `${dayId}T${meal.scheduledTime}:00.000Z`,
    calories: meal.calories,
    proteinGrams: meal.proteinGrams,
    entries: [],
  };
}

function createMealEntryFromMeal(meal: Meal): MealEntry {
  const primaryFood = meal.foods[0];
  const food = {
    id: primaryFood?.id ?? `${meal.id}:food`,
    name: primaryFood?.name ?? meal.title,
    brand: undefined,
    servings: [
      {
        id: `${meal.id}:serving`,
        label: primaryFood?.quantity ?? "1 serving",
        grams: 100,
        multiplier: 1,
      },
    ],
    nutrients: {
      calories: meal.calories,
      protein: meal.proteinGrams,
      carbs: meal.carbohydratesGrams,
      fat: meal.fatGrams,
    },
  };

  return {
    id: `${meal.id}:entry`,
    food,
    servings: 1,
    serving: food.servings[0]!,
  };
}

export interface PublishNutritionRuntimeMealProgressOptions {
  readonly dashboard: NutritionDashboard;
  readonly meal: Meal;
  readonly completed: boolean;
  readonly athleteId: string;
  readonly completedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes MealLogged or MealRemoved through the Sprint 32.2 integration. */
export async function publishNutritionRuntimeMealProgress({
  dashboard,
  meal,
  completed,
  athleteId,
  completedAt,
  correlationId = `nutrition-runtime:${dashboard.day.isoDate}`,
  eventId = `nutrition-runtime:meal:${meal.id}:${completedAt}`,
  publishedAt = completedAt,
}: PublishNutritionRuntimeMealProgressOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("NutritionProgressPublisher");
  const dayId = dashboard.day.isoDate;
  const domainMeal = mapExperienceMealToDomain(meal, dayId);

  if (completed) {
    await publishMealLogged({
      publisher,
      entry: createMealEntryFromMeal(meal),
      meal: domainMeal,
      dayId,
      correlationId,
      eventId,
      publishedAt,
      athleteId,
    });
    return;
  }

  const payload = createMealEntryFromMeal(meal);
  await publishNutritionProgress({
    publisher,
    event: createNutritionProgressEvent({
      id: eventId,
      type: "MealRemoved",
      occurredAt: completedAt,
      metadata: createNutritionProgressMetadata({
        source: "nutrition",
        correlationId,
        dayId,
        mealPlanId: null,
        athleteId,
        publishedAt,
      }),
      payload: Object.freeze({
        dayId,
        mealPlanId: null,
        mealId: domainMeal.id,
        mealName: domainMeal.name,
        mealEntryId: payload.id,
        foodId: payload.food.id,
        foodName: payload.food.name,
        servings: payload.servings,
        calories: meal.calories,
        proteinGrams: meal.proteinGrams,
        carbohydrateGrams: meal.carbohydratesGrams,
        fatGrams: meal.fatGrams,
        hydrationMl: null,
        targetHydrationMl: null,
        mealsLogged: null,
        completedAt,
        metrics: Object.freeze([]),
      }),
    }),
  });
}

export interface PublishNutritionRuntimeHydrationProgressOptions {
  readonly dashboard: NutritionDashboard;
  readonly athleteId: string;
  readonly loggedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes HydrationLogged through the Sprint 32.2 integration. */
export async function publishNutritionRuntimeHydrationProgress({
  dashboard,
  athleteId,
  loggedAt,
  correlationId = `nutrition-runtime:hydration:${dashboard.day.isoDate}`,
  eventId = `nutrition-runtime:hydration:${dashboard.day.isoDate}:${loggedAt}`,
  publishedAt = loggedAt,
}: PublishNutritionRuntimeHydrationProgressOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("NutritionProgressPublisher");
  const hydration = dashboard.hydration;

  await publishHydrationLogged({
    publisher,
    hydration: Object.freeze({
      currentMl: hydration.currentMl,
      targetMl: hydration.goalMl,
    }),
    dayId: dashboard.day.isoDate,
    correlationId,
    eventId,
    loggedAt,
    publishedAt,
    athleteId,
  });
}

export interface PublishNutritionRuntimeDailyCompletionOptions {
  readonly dashboard: NutritionDashboard;
  readonly athleteId: string;
  readonly completedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes DailyNutritionCompleted when all meals are completed. */
export async function publishNutritionRuntimeDailyCompletion({
  dashboard,
  athleteId,
  completedAt,
  correlationId = `nutrition-runtime:complete:${dashboard.day.isoDate}`,
  eventId = `nutrition-runtime:complete:${dashboard.day.isoDate}:${completedAt}`,
  publishedAt = completedAt,
}: PublishNutritionRuntimeDailyCompletionOptions): Promise<void> {
  if (
    dashboard.meals.length === 0 ||
    dashboard.mealSummary.completedMeals < dashboard.mealSummary.totalMeals
  ) {
    return;
  }

  const publisher = getCompositionRoot().resolve("NutritionProgressPublisher");

  await publishDailyNutritionCompleted({
    publisher,
    summary: Object.freeze({
      date: dashboard.day.isoDate,
      totalCalories: dashboard.macros.calories.current,
      calories: Object.freeze({
        current: dashboard.macros.calories.current,
        target: dashboard.macros.calories.target,
      }),
      protein: Object.freeze({
        current: dashboard.macros.protein.currentGrams,
        target: dashboard.macros.protein.targetGrams,
      }),
      carbs: Object.freeze({
        current: dashboard.macros.carbohydrates.currentGrams,
        target: dashboard.macros.carbohydrates.targetGrams,
      }),
      fat: Object.freeze({
        current: dashboard.macros.fat.currentGrams,
        target: dashboard.macros.fat.targetGrams,
      }),
      mealsLogged: dashboard.mealSummary.completedMeals,
    }),
    correlationId,
    eventId,
    publishedAt,
    athleteId,
  });
}
