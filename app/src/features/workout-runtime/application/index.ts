import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { CompleteSetInput } from "../models/CompleteSetInput";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutRuntimeConfiguration } from "../models/WorkoutRuntimeConfiguration";
import type { WorkoutRuntimeSummary } from "../models/WorkoutRuntimeSummary";
import {
  ActiveWorkout,
  createWorkoutRuntimeService,
  type WorkoutRuntimeService,
} from "../services/WorkoutRuntimeService";

function resolveService(
  service?: WorkoutRuntimeService,
): WorkoutRuntimeService {
  return service ?? createWorkoutRuntimeService();
}

/**
 * Public API — start a workout runtime from an immutable WorkoutSession.
 */
export function startWorkout(
  session: WorkoutSession,
  configuration: Partial<WorkoutRuntimeConfiguration> = {},
  service?: WorkoutRuntimeService,
): ActiveWorkout {
  return resolveService(service).start(session, configuration);
}

/**
 * Public API — pause a running workout.
 */
export function pauseWorkout(
  workout: ActiveWorkout,
  service?: WorkoutRuntimeService,
): WorkoutRuntimeSummary {
  return resolveService(service).pause(workout);
}

/**
 * Public API — resume a paused workout.
 */
export function resumeWorkout(
  workout: ActiveWorkout,
  service?: WorkoutRuntimeService,
): WorkoutRuntimeSummary {
  return resolveService(service).resume(workout);
}

/**
 * Public API — complete a workout (all exercises finished or skipped).
 */
export function completeWorkout(
  workout: ActiveWorkout,
  service?: WorkoutRuntimeService,
): WorkoutResult {
  return resolveService(service).complete(workout);
}

/**
 * Public API — skip the current exercise and advance.
 */
export function skipExercise(
  workout: ActiveWorkout,
  service?: WorkoutRuntimeService,
): WorkoutRuntimeSummary {
  return resolveService(service).skipExercise(workout);
}

/**
 * Public API — complete the current set with optional performance values.
 */
export function completeSet(
  workout: ActiveWorkout,
  input: CompleteSetInput = {},
  service?: WorkoutRuntimeService,
): WorkoutRuntimeSummary {
  return resolveService(service).completeSet(workout, input);
}

export type { ActiveWorkout };

/* ── Sprint 31.2 product experience application APIs ── */

export {
  loadWorkoutRuntime,
  type LoadWorkoutRuntimeOptions,
} from "./LoadWorkoutRuntime";
export {
  refreshWorkoutRuntime,
  type RefreshWorkoutRuntimeOptions,
} from "./RefreshWorkoutRuntime";
export {
  completeWorkoutSet,
  type CompleteWorkoutSetInput,
} from "./CompleteWorkoutSet";
export {
  updateWorkoutSet,
  type UpdateWorkoutSetInput,
} from "./UpdateWorkoutSet";
export {
  navigateWorkout,
  type NavigateWorkoutDirection,
} from "./NavigateWorkout";
export {
  finishWorkout,
  type FinishWorkoutOptions,
} from "./FinishWorkout";
export {
  startRestTimer,
  pauseRestTimer,
  resumeRestTimer,
  tickRestTimer,
  clearRestTimer,
} from "./RestTimer";
