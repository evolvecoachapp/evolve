import { loadWorkoutRuntime } from "./LoadWorkoutRuntime";
import type { WorkoutRuntimeExperienceService } from "../services/experience";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";

export interface RefreshWorkoutRuntimeOptions {
  readonly service?: WorkoutRuntimeExperienceService;
}

/** Explicit refresh semantics — same path as load. */
export async function refreshWorkoutRuntime(
  options: RefreshWorkoutRuntimeOptions = {},
): Promise<WorkoutRuntime> {
  return loadWorkoutRuntime(options);
}
