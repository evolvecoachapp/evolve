import type { Meal } from "../../../features/nutrition/models/Meal";
import type { MealEntry } from "../../../features/nutrition/models/MealEntry";
import {
  createNutritionProgressEvent,
  createNutritionProgressMetadata,
  type NutritionProgressResult,
} from "../models";
import { mapMealEntryToLoggedPayload } from "../mappers";
import type { NutritionProgressPublisher } from "../publishers";
import { publishNutritionProgress } from "./PublishNutritionProgress";

export interface PublishMealLoggedOptions {
  readonly publisher: NutritionProgressPublisher;
  readonly entry: MealEntry;
  readonly meal: Meal;
  readonly dayId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishMealLogged(
  options: PublishMealLoggedOptions,
): Promise<NutritionProgressResult> {
  const payload = mapMealEntryToLoggedPayload(
    options.entry,
    options.meal,
    options.dayId,
  );

  const event = createNutritionProgressEvent({
    id: options.eventId,
    type: "MealLogged",
    occurredAt: options.meal.time,
    metadata: createNutritionProgressMetadata({
      source: "nutrition",
      correlationId: options.correlationId,
      dayId: options.dayId,
      mealPlanId: null,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishNutritionProgress({ publisher: options.publisher, event });
}
