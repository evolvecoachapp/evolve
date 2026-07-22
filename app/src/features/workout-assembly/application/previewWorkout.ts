import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import {
  createWorkoutAssemblyService,
  type WorkoutAssemblyService,
} from "../services";

/**
 * Thin application wrapper — preview assembly with explanations enabled.
 */
export async function previewWorkout(
  request: WorkoutAssemblyRequest,
  service: WorkoutAssemblyService = createWorkoutAssemblyService(),
): Promise<WorkoutAssemblyResult> {
  return service.previewWorkout(request);
}
