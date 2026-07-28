export const WorkoutRuntimeStatuses = {
  IDLE: "idle",
  READY: "ready",
  ACTIVE: "active",
  RESTING: "resting",
  PAUSED: "paused",
  COMPLETED: "completed",
  EMPTY: "empty",
} as const;

export type WorkoutRuntimeStatus =
  (typeof WorkoutRuntimeStatuses)[keyof typeof WorkoutRuntimeStatuses];

/** Immutable operational workout runtime status (Sprint 31.2 presentation). */
export interface WorkoutRuntimeState {
  readonly status: WorkoutRuntimeStatus;
  readonly isActive: boolean;
  readonly isResting: boolean;
  readonly isPaused: boolean;
  readonly isCompleted: boolean;
  readonly isEmpty: boolean;
}

export function createWorkoutRuntimeState(
  status: WorkoutRuntimeStatus,
): WorkoutRuntimeState {
  return Object.freeze({
    status,
    isActive:
      status === WorkoutRuntimeStatuses.ACTIVE ||
      status === WorkoutRuntimeStatuses.RESTING,
    isResting: status === WorkoutRuntimeStatuses.RESTING,
    isPaused: status === WorkoutRuntimeStatuses.PAUSED,
    isCompleted: status === WorkoutRuntimeStatuses.COMPLETED,
    isEmpty: status === WorkoutRuntimeStatuses.EMPTY,
  });
}
