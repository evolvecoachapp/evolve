import type { NutritionProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { NutritionProgressEvent } from "../models";

/** Maps an immutable integration event to the Progress Analytics contract DTO. */
export function mapPayloadToProgressAnalyticsDto(
  event: NutritionProgressEvent,
): NutritionProgressIngestDto {
  return Object.freeze({
    eventId: event.id,
    eventType: event.type,
    occurredAt: event.occurredAt,
    metadata: Object.freeze({
      source: event.metadata.source,
      correlationId: event.metadata.correlationId,
      dayId: event.metadata.dayId,
      mealPlanId: event.metadata.mealPlanId,
      athleteId: event.metadata.athleteId,
      publishedAt: event.metadata.publishedAt,
    }),
    payload: Object.freeze({
      dayId: event.payload.dayId,
      mealPlanId: event.payload.mealPlanId,
      mealId: event.payload.mealId,
      mealName: event.payload.mealName,
      mealEntryId: event.payload.mealEntryId,
      foodId: event.payload.foodId,
      foodName: event.payload.foodName,
      servings: event.payload.servings,
      calories: event.payload.calories,
      proteinGrams: event.payload.proteinGrams,
      carbohydrateGrams: event.payload.carbohydrateGrams,
      fatGrams: event.payload.fatGrams,
      hydrationMl: event.payload.hydrationMl,
      targetHydrationMl: event.payload.targetHydrationMl,
      mealsLogged: event.payload.mealsLogged,
      completedAt: event.payload.completedAt,
      metrics: Object.freeze(
        event.payload.metrics.map((metric) =>
          Object.freeze({
            key: metric.key,
            label: metric.label,
            value: metric.value,
            unit: metric.unit,
          }),
        ),
      ),
    }),
  });
}
