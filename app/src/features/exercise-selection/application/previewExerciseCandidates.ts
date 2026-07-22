import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import { resolveService } from "../../../core/composition";
import type { ExerciseSelectionService } from "../services";

/**
 * Thin application wrapper — preview a broader candidate set.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function previewExerciseCandidates(
  request: ExerciseSelectionRequest,
  service: ExerciseSelectionService = resolveService(
    "ExerciseSelectionService",
  ),
): Promise<ExerciseSelectionResult> {
  return service.previewExerciseCandidates(request);
}
