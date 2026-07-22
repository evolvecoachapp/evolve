import { resolveService } from "../../../core/composition";
import type { WorkoutGenerationExplanation } from "../models/WorkoutGenerationExplanation";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import type { ProgramGenerationService } from "../services";

/**
 * Thin application wrapper — explain an in-hand generation result.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function explainWorkoutGeneration(
  result: WorkoutGenerationResult,
  service: ProgramGenerationService = resolveService(
    "ProgramGenerationService",
  ),
): Promise<readonly WorkoutGenerationExplanation[]> {
  return service.explainWorkoutGeneration(result);
}
