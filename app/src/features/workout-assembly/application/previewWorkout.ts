import { resolveService } from "../../../core/composition";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import type { WorkoutAssemblyService } from "../services";

/**
 * Thin application wrapper — preview assembly with explanations enabled.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function previewWorkout(
  request: WorkoutAssemblyRequest,
  service: WorkoutAssemblyService = resolveService("WorkoutAssemblyService"),
): Promise<WorkoutAssemblyResult> {
  return service.previewWorkout(request);
}
