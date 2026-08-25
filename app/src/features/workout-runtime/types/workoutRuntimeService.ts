import type { WorkoutRuntimeDto } from "./workoutRuntimeDto";

export type WorkoutRuntimeProviderId = "mock" | "backend" | "local";

/** Input for persisting one performed set against an in-progress WorkoutLog. */
export interface WorkoutRuntimeSaveSetInput {
  readonly runtimeId: string;
  readonly exerciseId: string;
  readonly setId: string;
  readonly weight: number | null;
  readonly repetitions: number | null;
  readonly rpe: number | null;
}

/** Contract for Workout Runtime experience backends — UI depends on this only. */
export interface WorkoutRuntimeExperienceService {
  readonly providerId: WorkoutRuntimeProviderId;

  getRuntime(): Promise<WorkoutRuntimeDto>;

  /**
   * Finish the in-progress WorkoutLog. Backend returns the reconciled
   * next-day runtime (never the completed log as the active session).
   * Mock/local may return void and keep in-memory completion local.
   */
  finishRuntime(input: {
    readonly runtimeId: string;
    readonly sessionNotes: string;
  }): Promise<WorkoutRuntimeDto | void>;

  /**
   * Start today's resolved workout as a WorkoutLog.
   * Optional: mock/local keep in-memory complete-set behavior.
   */
  startRuntime?(): Promise<WorkoutRuntimeDto>;

  /**
   * Persist a performed set, then return the refreshed log-backed runtime.
   * `runtimeId` must be the WorkoutLog id, never the template Workout id.
   */
  saveSet?(input: WorkoutRuntimeSaveSetInput): Promise<WorkoutRuntimeDto>;

  /** Advance the program cursor past a scheduled rest day. */
  advanceRestDay?(): Promise<WorkoutRuntimeDto>;
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
