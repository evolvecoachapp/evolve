import { resolveService } from "../../../core/composition";
import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import type { TrainingAdaptationService } from "../services";

/**
 * Thin application wrapper — evaluate readiness and adaptation recommendations.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function evaluateTrainingReadiness(
  request: TrainingAdaptationRequest,
  service: TrainingAdaptationService = resolveService(
    "TrainingAdaptationService",
  ),
): Promise<TrainingAdaptationResult> {
  return service.evaluateTrainingReadiness(request);
}
