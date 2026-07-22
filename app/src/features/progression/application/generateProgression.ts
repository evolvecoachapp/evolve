import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import {
  createProgressionService,
  type ProgressionService,
} from "../services";

/**
 * Thin application wrapper — generate a multi-week progression plan.
 */
export async function generateProgression(
  request: ProgressionRequest,
  service: ProgressionService = createProgressionService(),
): Promise<ProgressionPlan> {
  return service.generateProgression(request);
}
