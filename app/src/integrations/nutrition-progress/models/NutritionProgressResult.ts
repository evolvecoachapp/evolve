/** Result returned by a nutrition progress subscriber. */
export interface NutritionProgressSubscriberResult {
  readonly subscriberId: string;
  readonly accepted: boolean;
  readonly appliedAt: string;
}

export function createNutritionProgressSubscriberResult(
  input: NutritionProgressSubscriberResult,
): NutritionProgressSubscriberResult {
  return Object.freeze({ ...input });
}

/** Result returned when a nutrition progress event is published. */
export interface NutritionProgressResult {
  readonly eventId: string;
  readonly accepted: boolean;
  readonly publishedAt: string;
  readonly subscriberResults: readonly NutritionProgressSubscriberResult[];
}

export function createNutritionProgressResult(
  input: NutritionProgressResult,
): NutritionProgressResult {
  return Object.freeze({
    ...input,
    subscriberResults: Object.freeze([...input.subscriberResults]),
  });
}
