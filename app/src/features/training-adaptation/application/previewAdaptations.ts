import { resolveService } from "../../../core/composition";
import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import type { TrainingAdaptationService } from "../services";

/**
 * Thin application wrapper — preview adaptations with explanations enabled.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function previewAdaptations(
  request: TrainingAdaptationRequest,
  service: TrainingAdaptationService = resolveService(
    "TrainingAdaptationService",
  ),
): Promise<TrainingAdaptationResult> {
  return service.previewAdaptations(request);
}
