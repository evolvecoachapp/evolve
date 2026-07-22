import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import {
  createTrainingAdaptationService,
  type TrainingAdaptationService,
} from "../services";

/**
 * Thin application wrapper — preview adaptations with explanations enabled.
 */
export async function previewAdaptations(
  request: TrainingAdaptationRequest,
  service: TrainingAdaptationService = createTrainingAdaptationService(),
): Promise<TrainingAdaptationResult> {
  return service.previewAdaptations(request);
}
