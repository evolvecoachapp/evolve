import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkoutAssemblyService } from "../../workout-assembly/services/WorkoutAssemblyService";
import type { WorkspaceWorkout } from "../../unified-workspace/models/WorkspaceWorkout";
import { mapWorkoutRuntime } from "../mappers";
import { mapWorkoutSessionToRuntimeDto } from "../mappers/mapWorkoutSessionToRuntimeDto";
import { mapWorkspaceWorkoutToRuntimeDto } from "../mappers/mapWorkspaceWorkoutToRuntimeDto";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";

async function resolveHydratedWorkoutSession(
  workout: WorkspaceWorkout,
  assemblyService: WorkoutAssemblyService,
): Promise<WorkoutSession | null> {
  if (workout.planId) {
    const cached = await assemblyService.loadCached(workout.planId);
    if (cached?.session) {
      return cached.session;
    }
  }

  const cachedResults = await assemblyService.listCachedResults();
  return cachedResults[0]?.session ?? null;
}

export interface LoadHydratedWorkoutRuntimeOptions {
  readonly athleteId: string;
}

/**
 * Loads today's workout runtime from hydrated Unified Workspace and optional
 * cached Workout Assembly output.
 */
export async function loadHydratedWorkoutRuntime({
  athleteId,
}: LoadHydratedWorkoutRuntimeOptions): Promise<WorkoutRuntime | null> {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  if (!workspace) {
    return null;
  }

  const workout = workspace.workout;
  if (!workout.present) {
    return mapWorkoutRuntime({
      dto: mapWorkspaceWorkoutToRuntimeDto(workout),
    });
  }

  const assemblyService = root.resolve("WorkoutAssemblyService");
  const session = await resolveHydratedWorkoutSession(workout, assemblyService);
  const dto = session
    ? mapWorkoutSessionToRuntimeDto(session, workout)
    : mapWorkspaceWorkoutToRuntimeDto(workout);

  return mapWorkoutRuntime({ dto });
}
