import { resolveService } from "../../../core/composition";
import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import type { ExerciseSelectionService } from "../services";

/**
 * Thin application wrapper — select exercise candidates for a blueprint day.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function selectExercises(
  request: ExerciseSelectionRequest,
  service: ExerciseSelectionService = resolveService(
    "ExerciseSelectionService",
  ),
): Promise<ExerciseSelectionResult> {
  return service.selectExercises(request);
}
