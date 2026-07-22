import { resolveService } from "../../../core/composition";
import type { WorkoutAssemblyExplanation } from "../models/WorkoutAssemblyExplanation";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import type { WorkoutAssemblyService } from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand assembly result.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function explainWorkout(
  requestIdOrResult: string | WorkoutAssemblyResult,
  service: WorkoutAssemblyService = resolveService("WorkoutAssemblyService"),
): Promise<readonly WorkoutAssemblyExplanation[]> {
  return service.explainWorkout(requestIdOrResult);
}
