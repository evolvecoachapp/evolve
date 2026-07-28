import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import {
  createWorkoutTimer,
  WorkoutTimerStatuses,
  createIdleWorkoutTimer,
} from "../models/experience/WorkoutTimer";
import { WorkoutRuntimeStatuses } from "../models/experience/WorkoutRuntimeState";
import { rebuildWorkoutRuntime } from "../mappers";

/** Starts a rest timer with the given target duration. */
export function startRestTimer(
  runtime: WorkoutRuntime,
  targetSeconds: number,
  label = "Rest",
): WorkoutRuntime {
  const safeTarget = Math.max(0, Math.floor(targetSeconds));
  return rebuildWorkoutRuntime(runtime, {
    timer: createWorkoutTimer({
      status: WorkoutTimerStatuses.RUNNING,
      targetSeconds: safeTarget,
      remainingSeconds: safeTarget,
      elapsedSeconds: 0,
      isOvertime: false,
      label,
    }),
    status: WorkoutRuntimeStatuses.RESTING,
  });
}

/** Pauses the active rest timer. */
export function pauseRestTimer(runtime: WorkoutRuntime): WorkoutRuntime {
  if (runtime.timer.status !== WorkoutTimerStatuses.RUNNING) {
    return runtime;
  }
  return rebuildWorkoutRuntime(runtime, {
    timer: createWorkoutTimer({
      ...runtime.timer,
      status: WorkoutTimerStatuses.PAUSED,
    }),
    status: WorkoutRuntimeStatuses.PAUSED,
  });
}

/** Resumes a paused rest timer. */
export function resumeRestTimer(runtime: WorkoutRuntime): WorkoutRuntime {
  if (runtime.timer.status !== WorkoutTimerStatuses.PAUSED) {
    return runtime;
  }
  return rebuildWorkoutRuntime(runtime, {
    timer: createWorkoutTimer({
      ...runtime.timer,
      status: WorkoutTimerStatuses.RUNNING,
    }),
    status: WorkoutRuntimeStatuses.RESTING,
  });
}

/** Advances the rest timer by one second (injected tick). */
export function tickRestTimer(runtime: WorkoutRuntime): WorkoutRuntime {
  if (runtime.timer.status !== WorkoutTimerStatuses.RUNNING) {
    return runtime;
  }

  const elapsedSeconds = runtime.timer.elapsedSeconds + 1;
  const rawRemaining = runtime.timer.targetSeconds - elapsedSeconds;

  if (rawRemaining <= 0) {
    return rebuildWorkoutRuntime(runtime, {
      timer: createWorkoutTimer({
        ...runtime.timer,
        status: WorkoutTimerStatuses.COMPLETED,
        remainingSeconds: 0,
        elapsedSeconds: Math.max(elapsedSeconds, runtime.timer.targetSeconds),
        isOvertime: rawRemaining < 0,
      }),
      status: WorkoutRuntimeStatuses.ACTIVE,
    });
  }

  return rebuildWorkoutRuntime(runtime, {
    timer: createWorkoutTimer({
      ...runtime.timer,
      elapsedSeconds,
      remainingSeconds: rawRemaining,
      isOvertime: false,
      status: WorkoutTimerStatuses.RUNNING,
    }),
    status: WorkoutRuntimeStatuses.RESTING,
  });
}

/** Clears the rest timer. */
export function clearRestTimer(runtime: WorkoutRuntime): WorkoutRuntime {
  return rebuildWorkoutRuntime(runtime, {
    timer: createIdleWorkoutTimer(),
    status:
      runtime.progress.completedSets > 0
        ? WorkoutRuntimeStatuses.ACTIVE
        : WorkoutRuntimeStatuses.READY,
  });
}
