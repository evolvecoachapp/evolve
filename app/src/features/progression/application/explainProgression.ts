import { resolveService } from "../../../core/composition";
import type { ProgressionExplanation } from "../models/ProgressionExplanation";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionService } from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand progression plan.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function explainProgression(
  requestIdOrPlan: string | ProgressionPlan,
  service: ProgressionService = resolveService("ProgressionService"),
): Promise<readonly ProgressionExplanation[]> {
  return service.explainProgression(requestIdOrPlan);
}
