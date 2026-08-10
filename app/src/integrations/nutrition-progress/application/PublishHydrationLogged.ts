import type { Hydration } from "../../../features/nutrition/models/Hydration";
import {
  createNutritionProgressEvent,
  createNutritionProgressMetadata,
  type NutritionProgressResult,
} from "../models";
import { mapHydrationToLoggedPayload } from "../mappers";
import type { NutritionProgressPublisher } from "../publishers";
import { publishNutritionProgress } from "./PublishNutritionProgress";

export interface PublishHydrationLoggedOptions {
  readonly publisher: NutritionProgressPublisher;
  readonly hydration: Hydration;
  readonly dayId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly loggedAt: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishHydrationLogged(
  options: PublishHydrationLoggedOptions,
): Promise<NutritionProgressResult> {
  const payload = mapHydrationToLoggedPayload(
    options.hydration,
    options.dayId,
    options.loggedAt,
  );

  const event = createNutritionProgressEvent({
    id: options.eventId,
    type: "HydrationLogged",
    occurredAt: options.loggedAt,
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
