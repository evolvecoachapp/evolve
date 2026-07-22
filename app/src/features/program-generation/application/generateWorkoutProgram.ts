import { resolveService } from "../../../core/composition";
import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import type { ProgramGenerationService } from "../services";

/**
 * Thin application wrapper — generate a complete workout program via the pipeline.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function generateWorkoutProgram(
  request: WorkoutGenerationRequest,
  service: ProgramGenerationService = resolveService(
    "ProgramGenerationService",
  ),
): Promise<WorkoutGenerationResult> {
  return service.generateWorkoutProgram(request);
}
