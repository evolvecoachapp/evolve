export const WorkoutTimerStatuses = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export type WorkoutTimerStatus =
  (typeof WorkoutTimerStatuses)[keyof typeof WorkoutTimerStatuses];

/** Immutable rest / session timer presentation model. */
export interface WorkoutTimer {
  readonly status: WorkoutTimerStatus;
  readonly targetSeconds: number;
  readonly remainingSeconds: number;
  readonly elapsedSeconds: number;
  readonly isOvertime: boolean;
  readonly label: string;
}

export function createWorkoutTimer(input: WorkoutTimer): WorkoutTimer {
  return Object.freeze({ ...input });
}

export function createIdleWorkoutTimer(
  targetSeconds = 0,
  label = "Rest",
): WorkoutTimer {
  return createWorkoutTimer({
    status: WorkoutTimerStatuses.IDLE,
    targetSeconds,
    remainingSeconds: targetSeconds,
    elapsedSeconds: 0,
    isOvertime: false,
    label,
  });
}
