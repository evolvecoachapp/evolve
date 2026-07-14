import { backendWorkoutService } from "../providers/BackendWorkoutService";
import { localWorkoutService } from "../providers/LocalWorkoutService";
import { mockWorkoutService } from "../providers/MockWorkoutService";
import type { WorkoutProviderId, WorkoutService } from "../types/workoutService";

const PROVIDERS: Record<WorkoutProviderId, WorkoutService> = {
  mock: mockWorkoutService,
  backend: backendWorkoutService,
  local: localWorkoutService,
};

/** Resolves the active provider from env — defaults to mock when unset or unknown. */
export function resolveWorkoutProviderId(): WorkoutProviderId {
  const configured = process.env.EXPO_PUBLIC_WORKOUT_PROVIDER as WorkoutProviderId | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "mock";
}

export function createWorkoutService(
  providerId: WorkoutProviderId = resolveWorkoutProviderId(),
): WorkoutService {
  return PROVIDERS[providerId];
}
