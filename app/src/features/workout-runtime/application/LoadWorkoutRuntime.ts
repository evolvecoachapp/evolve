import { mapWorkoutRuntime } from "../mappers";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import {
  workoutRuntimeExperienceService,
  type WorkoutRuntimeExperienceService,
} from "../services/experience";

export interface LoadWorkoutRuntimeOptions {
  readonly service?: WorkoutRuntimeExperienceService;
}

/** Loads today's workout runtime via Application → ExperienceService. */
export async function loadWorkoutRuntime({
  service = workoutRuntimeExperienceService,
}: LoadWorkoutRuntimeOptions = {}): Promise<WorkoutRuntime> {
  const dto = await service.getRuntime();
  return mapWorkoutRuntime({ dto });
}
