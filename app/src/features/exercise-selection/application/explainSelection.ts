import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import type { SelectionExplanation } from "../models/SelectionExplanation";
import { resolveService } from "../../../core/composition";
import type { ExerciseSelectionService } from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand selection result.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function explainSelection(
  requestIdOrResult: string | ExerciseSelectionResult,
  service: ExerciseSelectionService = resolveService(
    "ExerciseSelectionService",
  ),
): Promise<readonly SelectionExplanation[]> {
  return service.explainSelection(requestIdOrResult);
}
