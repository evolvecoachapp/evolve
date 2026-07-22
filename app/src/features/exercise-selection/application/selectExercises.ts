import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import {
  createExerciseSelectionService,
  type ExerciseSelectionService,
} from "../services";

/**
 * Thin application wrapper — select exercise candidates for a blueprint day.
 */
export async function selectExercises(
  request: ExerciseSelectionRequest,
  service: ExerciseSelectionService = createExerciseSelectionService(),
): Promise<ExerciseSelectionResult> {
  return service.selectExercises(request);
}
