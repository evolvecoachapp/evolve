import { resolveService } from "../../../core/composition";
import type { AdaptationExplanation } from "../models/AdaptationExplanation";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import type { TrainingAdaptationService } from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand adaptation result.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function explainAdaptations(
  requestIdOrResult: string | TrainingAdaptationResult,
  service: TrainingAdaptationService = resolveService(
    "TrainingAdaptationService",
  ),
): Promise<readonly AdaptationExplanation[]> {
  return service.explainAdaptations(requestIdOrResult);
}
