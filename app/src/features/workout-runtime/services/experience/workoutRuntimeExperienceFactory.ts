import { backendWorkoutRuntimeService } from "../../providers/BackendWorkoutRuntimeService";
import { localWorkoutRuntimeService } from "../../providers/LocalWorkoutRuntimeService";
import { mockWorkoutRuntimeService } from "../../providers/MockWorkoutRuntimeService";
import type {
  WorkoutRuntimeExperienceService,
  WorkoutRuntimeProviderId,
} from "../../types/workoutRuntimeService";

const PROVIDERS: Record<
  WorkoutRuntimeProviderId,
  WorkoutRuntimeExperienceService
> = {
  mock: mockWorkoutRuntimeService,
  backend: backendWorkoutRuntimeService,
  local: localWorkoutRuntimeService,
};

/** Resolves the active provider from env — defaults to backend when unset or unknown, mirroring `workoutServiceFactory`. */
export function resolveWorkoutRuntimeProviderId(): WorkoutRuntimeProviderId {
  const configured = process.env
    .EXPO_PUBLIC_WORKOUT_RUNTIME_PROVIDER as WorkoutRuntimeProviderId | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "backend";
}

export function createWorkoutRuntimeExperienceService(
  providerId: WorkoutRuntimeProviderId = resolveWorkoutRuntimeProviderId(),
): WorkoutRuntimeExperienceService {
  return PROVIDERS[providerId];
}
