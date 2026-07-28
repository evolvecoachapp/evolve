export const WorkoutLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type WorkoutLoadingStatus =
  (typeof WorkoutLoadingStatuses)[keyof typeof WorkoutLoadingStatuses];

/** Immutable workout loading state — presentation only. */
export interface WorkoutLoadingState {
  readonly status: WorkoutLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createWorkoutLoadingState(
  status: WorkoutLoadingStatus,
): WorkoutLoadingState {
  return Object.freeze({
    status,
    isLoading: status === WorkoutLoadingStatuses.LOADING,
    isRefreshing: status === WorkoutLoadingStatuses.REFRESHING,
  });
}
