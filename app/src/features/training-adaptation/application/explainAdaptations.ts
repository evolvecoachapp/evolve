import type { AdaptationExplanation } from "../models/AdaptationExplanation";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import {
  createTrainingAdaptationService,
  type TrainingAdaptationService,
} from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand adaptation result.
 */
export async function explainAdaptations(
  requestIdOrResult: string | TrainingAdaptationResult,
  service: TrainingAdaptationService = createTrainingAdaptationService(),
): Promise<readonly AdaptationExplanation[]> {
  return service.explainAdaptations(requestIdOrResult);
}
