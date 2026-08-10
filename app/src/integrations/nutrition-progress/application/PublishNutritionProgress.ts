import type { NutritionProgressPublisher } from "../publishers";
import type { NutritionProgressEvent, NutritionProgressResult } from "../models";

export interface PublishNutritionProgressOptions {
  readonly publisher: NutritionProgressPublisher;
  readonly event: NutritionProgressEvent;
}

export async function publishNutritionProgress(
  options: PublishNutritionProgressOptions,
): Promise<NutritionProgressResult> {
  return options.publisher.publish(options.event);
}
