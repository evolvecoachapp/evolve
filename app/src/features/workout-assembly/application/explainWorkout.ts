import type { WorkoutAssemblyExplanation } from "../models/WorkoutAssemblyExplanation";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import {
  createWorkoutAssemblyService,
  type WorkoutAssemblyService,
} from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand assembly result.
 */
export async function explainWorkout(
  requestIdOrResult: string | WorkoutAssemblyResult,
  service: WorkoutAssemblyService = createWorkoutAssemblyService(),
): Promise<readonly WorkoutAssemblyExplanation[]> {
  return service.explainWorkout(requestIdOrResult);
}
