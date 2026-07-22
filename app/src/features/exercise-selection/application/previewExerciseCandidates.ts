import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import {
  createExerciseSelectionService,
  type ExerciseSelectionService,
} from "../services";

/**
 * Thin application wrapper — preview a broader candidate set.
 */
export async function previewExerciseCandidates(
  request: ExerciseSelectionRequest,
  service: ExerciseSelectionService = createExerciseSelectionService(),
): Promise<ExerciseSelectionResult> {
  return service.previewExerciseCandidates(request);
}
