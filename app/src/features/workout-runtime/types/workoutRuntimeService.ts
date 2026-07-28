import type { WorkoutRuntimeDto } from "./workoutRuntimeDto";

export type WorkoutRuntimeProviderId = "mock" | "backend" | "local";

/** Contract for Workout Runtime experience backends — UI depends on this only. */
export interface WorkoutRuntimeExperienceService {
  readonly providerId: WorkoutRuntimeProviderId;

  getRuntime(): Promise<WorkoutRuntimeDto>;

  finishRuntime(input: {
    readonly runtimeId: string;
    readonly sessionNotes: string;
  }): Promise<void>;
}

export class WorkoutRuntimeExperienceError extends Error {
  constructor(
    message: string,
    readonly providerId?: WorkoutRuntimeProviderId,
  ) {
    super(message);
    this.name = "WorkoutRuntimeExperienceError";
  }
}
