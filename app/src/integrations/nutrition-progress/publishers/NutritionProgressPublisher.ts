import type { NutritionProgressEvent } from "../models";
import type { NutritionProgressResult } from "../models/NutritionProgressResult";

/** Contract for nutrition progress event subscribers. */
export interface NutritionProgressEventSubscriber {
  readonly id: string;
  onEvent(event: NutritionProgressEvent): Promise<NutritionProgressResult["subscriberResults"][number]>;
}

export interface NutritionProgressPublisher {
  readonly id: string;
  publish(event: NutritionProgressEvent): Promise<NutritionProgressResult>;
  getPublishedEventIds(): readonly string[];
}
