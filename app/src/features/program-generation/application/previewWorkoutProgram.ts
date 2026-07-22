import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import {
  createProgramGenerationService,
  type ProgramGenerationService,
} from "../services";

/**
 * Thin application wrapper — preview generation with explanations enabled.
 */
export async function previewWorkoutProgram(
  request: WorkoutGenerationRequest,
  service: ProgramGenerationService = createProgramGenerationService(),
): Promise<WorkoutGenerationResult> {
  return service.previewWorkoutProgram(request);
}
