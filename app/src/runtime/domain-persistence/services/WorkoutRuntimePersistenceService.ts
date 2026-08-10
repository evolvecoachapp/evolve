import type { WorkoutRuntimePersistenceState } from "../models/WorkoutRuntimePersistenceState";
import { createWorkoutRuntimePersistenceState } from "../models/WorkoutRuntimePersistenceState";

export interface WorkoutRuntimePersistenceResult {
  readonly success: boolean;
  readonly state: WorkoutRuntimePersistenceState | null;
  readonly message?: string;
}

export interface WorkoutRuntimePersistenceBuildInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly runtime: WorkoutRuntimePersistenceState["runtime"];
}

/**
 * In-memory facade for persisted workout runtime state (Sprint 35.4).
 */
export class WorkoutRuntimePersistenceService {
  private readonly latestByAthlete = new Map<string, WorkoutRuntimePersistenceState>();

  build(input: WorkoutRuntimePersistenceBuildInput): WorkoutRuntimePersistenceResult {
    const state = createWorkoutRuntimePersistenceState({
      athleteId: input.athleteId,
      runtime: input.runtime,
    });
    this.latestByAthlete.set(input.athleteId, state);
    return Object.freeze({ success: true, state });
  }

  getState(athleteId: string): WorkoutRuntimePersistenceState | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  restorePersisted(state: WorkoutRuntimePersistenceState): void {
    this.latestByAthlete.set(state.athleteId, state);
  }
}

export function createWorkoutRuntimePersistenceService(): WorkoutRuntimePersistenceService {
  return new WorkoutRuntimePersistenceService();
}
