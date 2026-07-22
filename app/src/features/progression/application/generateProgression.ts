import { resolveService } from "../../../core/composition";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import type { ProgressionService } from "../services";

/**
 * Thin application wrapper — generate a multi-week progression plan.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function generateProgression(
  request: ProgressionRequest,
  service: ProgressionService = resolveService("ProgressionService"),
): Promise<ProgressionPlan> {
  return service.generateProgression(request);
}
