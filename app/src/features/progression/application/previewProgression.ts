import { resolveService } from "../../../core/composition";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import type { ProgressionService } from "../services";

/**
 * Thin application wrapper — preview progression with explanations enabled.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function previewProgression(
  request: ProgressionRequest,
  service: ProgressionService = resolveService("ProgressionService"),
): Promise<ProgressionPlan> {
  return service.previewProgression(request);
}
