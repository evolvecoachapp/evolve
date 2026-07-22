import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import type { SelectionExplanation } from "../models/SelectionExplanation";
import {
  createExerciseSelectionService,
  type ExerciseSelectionService,
} from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand selection result.
 */
export async function explainSelection(
  requestIdOrResult: string | ExerciseSelectionResult,
  service: ExerciseSelectionService = createExerciseSelectionService(),
): Promise<readonly SelectionExplanation[]> {
  return service.explainSelection(requestIdOrResult);
}
