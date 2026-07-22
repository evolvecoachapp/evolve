import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import {
  createTrainingAdaptationService,
  type TrainingAdaptationService,
} from "../services";

/**
 * Thin application wrapper — evaluate readiness and adaptation recommendations.
 */
export async function evaluateTrainingReadiness(
  request: TrainingAdaptationRequest,
  service: TrainingAdaptationService = createTrainingAdaptationService(),
): Promise<TrainingAdaptationResult> {
  return service.evaluateTrainingReadiness(request);
}
