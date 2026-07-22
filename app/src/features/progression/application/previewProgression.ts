import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import {
  createProgressionService,
  type ProgressionService,
} from "../services";

/**
 * Thin application wrapper — preview progression with explanations enabled.
 */
export async function previewProgression(
  request: ProgressionRequest,
  service: ProgressionService = createProgressionService(),
): Promise<ProgressionPlan> {
  return service.previewProgression(request);
}
