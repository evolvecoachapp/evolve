import { createWorkoutNotes } from "../models/experience/WorkoutNotes";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import { createIdleWorkoutTimer } from "../models/experience/WorkoutTimer";
import { WorkoutRuntimeStatuses } from "../models/experience/WorkoutRuntimeState";
import { rebuildWorkoutRuntime } from "../mappers";
import {
  workoutRuntimeExperienceService,
  type WorkoutRuntimeExperienceService,
} from "../services/experience";
import { publishWorkoutRuntimeCompletion } from "./publishWorkoutRuntimeCompletion";

export interface FinishWorkoutOptions {
  readonly service?: WorkoutRuntimeExperienceService;
  readonly now?: Date;
  readonly athleteId?: string;
  readonly programName?: string | null;
  readonly publishProgress?: boolean;
}

/** Finishes the active workout and notifies the experience provider. */
export async function finishWorkout(
  runtime: WorkoutRuntime,
  {
    service,
    now = new Date(),
    athleteId,
    programName = null,
    publishProgress = false,
  }: FinishWorkoutOptions = {},
): Promise<WorkoutRuntime> {
  if (service) {
    await service.finishRuntime({
      runtimeId: runtime.id,
      sessionNotes: runtime.notes.sessionNotes,
    });
  }

  const completedAt = now.toISOString();
  const completed = rebuildWorkoutRuntime(runtime, {
    timer: createIdleWorkoutTimer(),
    notes: createWorkoutNotes(runtime.notes.sessionNotes, completedAt),
    finishedAt: completedAt,
    status: WorkoutRuntimeStatuses.COMPLETED,
  });

  if (publishProgress && athleteId) {
    await publishWorkoutRuntimeCompletion({
      runtime: completed,
      athleteId,
      programName,
      completedAt,
    });
  }

  return completed;
}
