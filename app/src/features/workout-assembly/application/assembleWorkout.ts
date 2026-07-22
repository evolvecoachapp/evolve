import { resolveService } from "../../../core/composition";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import type { WorkoutAssemblyService } from "../services";

/**
 * Thin application wrapper — assemble a final WorkoutSession.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function assembleWorkout(
  request: WorkoutAssemblyRequest,
  service: WorkoutAssemblyService = resolveService("WorkoutAssemblyService"),
): Promise<WorkoutAssemblyResult> {
  return service.assembleWorkout(request);
}
