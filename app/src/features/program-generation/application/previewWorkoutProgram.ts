import { resolveService } from "../../../core/composition";
import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import type { ProgramGenerationService } from "../services";

/**
 * Thin application wrapper — preview generation with explanations enabled.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function previewWorkoutProgram(
  request: WorkoutGenerationRequest,
  service: ProgramGenerationService = resolveService(
    "ProgramGenerationService",
  ),
): Promise<WorkoutGenerationResult> {
  return service.previewWorkoutProgram(request);
}
