import type { NutritionProgressEventType } from "../events";
import type { NutritionAnalyticsPayload } from "./NutritionAnalyticsPayload";
import type { NutritionProgressMetadata } from "./NutritionProgressMetadata";

/** Immutable nutrition progress integration event. */
export interface NutritionProgressEvent {
  readonly id: string;
  readonly type: NutritionProgressEventType;
  readonly occurredAt: string;
  readonly metadata: NutritionProgressMetadata;
  readonly payload: NutritionAnalyticsPayload;
}

export function createNutritionProgressEvent(
  input: NutritionProgressEvent,
): NutritionProgressEvent {
  return Object.freeze({
    ...input,
    metadata: Object.freeze({ ...input.metadata }),
    payload: Object.freeze({
      ...input.payload,
      metrics: Object.freeze([...input.payload.metrics]),
    }),
  });
}
