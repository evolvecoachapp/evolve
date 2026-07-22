import type { WorkoutGenerationExplanation } from "../models/WorkoutGenerationExplanation";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import {
  createProgramGenerationService,
  type ProgramGenerationService,
} from "../services";

/**
 * Thin application wrapper — explain an in-hand generation result.
 */
export async function explainWorkoutGeneration(
  result: WorkoutGenerationResult,
  service: ProgramGenerationService = createProgramGenerationService(),
): Promise<readonly WorkoutGenerationExplanation[]> {
  return service.explainWorkoutGeneration(result);
}
