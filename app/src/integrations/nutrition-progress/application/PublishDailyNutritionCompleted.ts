import type { NutritionSummary } from "../../../features/nutrition/models/NutritionSummary";
import {
  createNutritionProgressEvent,
  createNutritionProgressMetadata,
  type NutritionProgressResult,
} from "../models";
import { mapNutritionSummaryToCompletionPayload } from "../mappers";
import type { NutritionProgressPublisher } from "../publishers";
import { publishNutritionProgress } from "./PublishNutritionProgress";

export interface PublishDailyNutritionCompletedOptions {
  readonly publisher: NutritionProgressPublisher;
  readonly summary: NutritionSummary;
  readonly correlationId: string;
  readonly eventId: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishDailyNutritionCompleted(
  options: PublishDailyNutritionCompletedOptions,
): Promise<NutritionProgressResult> {
  const payload = mapNutritionSummaryToCompletionPayload(options.summary);

  const event = createNutritionProgressEvent({
    id: options.eventId,
    type: "DailyNutritionCompleted",
    occurredAt: options.summary.date,
    metadata: createNutritionProgressMetadata({
      source: "nutrition",
      correlationId: options.correlationId,
      dayId: options.summary.date,
      mealPlanId: null,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishNutritionProgress({ publisher: options.publisher, event });
}
