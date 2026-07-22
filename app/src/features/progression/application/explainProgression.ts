import type { ProgressionExplanation } from "../models/ProgressionExplanation";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import {
  createProgressionService,
  type ProgressionService,
} from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand progression plan.
 */
export async function explainProgression(
  requestIdOrPlan: string | ProgressionPlan,
  service: ProgressionService = createProgressionService(),
): Promise<readonly ProgressionExplanation[]> {
  return service.explainProgression(requestIdOrPlan);
}
