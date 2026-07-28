import { createWorkoutNotes } from "../models/experience/WorkoutNotes";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import { createIdleWorkoutTimer } from "../models/experience/WorkoutTimer";
import { WorkoutRuntimeStatuses } from "../models/experience/WorkoutRuntimeState";
import { rebuildWorkoutRuntime } from "../mappers";
import {
  workoutRuntimeExperienceService,
  type WorkoutRuntimeExperienceService,
} from "../services/experience";

export interface FinishWorkoutOptions {
  readonly service?: WorkoutRuntimeExperienceService;
  readonly now?: Date;
}

/** Finishes the active workout and notifies the experience provider. */
export async function finishWorkout(
  runtime: WorkoutRuntime,
  {
    service = workoutRuntimeExperienceService,
    now = new Date(),
  }: FinishWorkoutOptions = {},
): Promise<WorkoutRuntime> {
  await service.finishRuntime({
    runtimeId: runtime.id,
    sessionNotes: runtime.notes.sessionNotes,
  });

  return rebuildWorkoutRuntime(runtime, {
    timer: createIdleWorkoutTimer(),
    notes: createWorkoutNotes(
      runtime.notes.sessionNotes,
      now.toISOString(),
    ),
    finishedAt: now.toISOString(),
    status: WorkoutRuntimeStatuses.COMPLETED,
  });
}
