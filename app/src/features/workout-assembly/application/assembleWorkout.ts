import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import {
  createWorkoutAssemblyService,
  type WorkoutAssemblyService,
} from "../services";

/**
 * Thin application wrapper — assemble a final WorkoutSession.
 */
export async function assembleWorkout(
  request: WorkoutAssemblyRequest,
  service: WorkoutAssemblyService = createWorkoutAssemblyService(),
): Promise<WorkoutAssemblyResult> {
  return service.assembleWorkout(request);
}
