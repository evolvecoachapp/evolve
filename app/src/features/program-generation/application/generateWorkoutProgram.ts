import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import {
  createProgramGenerationService,
  type ProgramGenerationService,
} from "../services";

/**
 * Thin application wrapper — generate a complete workout program via the pipeline.
 */
export async function generateWorkoutProgram(
  request: WorkoutGenerationRequest,
  service: ProgramGenerationService = createProgramGenerationService(),
): Promise<WorkoutGenerationResult> {
  return service.generateWorkoutProgram(request);
}
