/** Immutable workout error state — presentation only. */
export interface WorkoutErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createWorkoutErrorState(
  message: string,
  code = "workout_runtime_error",
  retryable = true,
): WorkoutErrorState {
  return Object.freeze({
    message,
    code,
    retryable,
  });
}
