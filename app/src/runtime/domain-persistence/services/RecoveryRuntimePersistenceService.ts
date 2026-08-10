import type { RecoveryRuntimePersistenceState } from "../models/RecoveryRuntimePersistenceState";
import { createRecoveryRuntimePersistenceState } from "../models/RecoveryRuntimePersistenceState";

export interface RecoveryRuntimePersistenceResult {
  readonly success: boolean;
  readonly state: RecoveryRuntimePersistenceState | null;
  readonly message?: string;
}

export interface RecoveryRuntimePersistenceBuildInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly state: RecoveryRuntimePersistenceState;
}

/**
 * In-memory facade for persisted recovery runtime overlays (Sprint 35.4).
 */
export class RecoveryRuntimePersistenceService {
  private readonly latestByAthlete = new Map<string, RecoveryRuntimePersistenceState>();

  build(input: RecoveryRuntimePersistenceBuildInput): RecoveryRuntimePersistenceResult {
    const state = createRecoveryRuntimePersistenceState(input.state);
    this.latestByAthlete.set(input.athleteId, state);
    return Object.freeze({ success: true, state });
  }

  getState(athleteId: string): RecoveryRuntimePersistenceState | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  restorePersisted(state: RecoveryRuntimePersistenceState): void {
    this.latestByAthlete.set(state.athleteId, state);
  }
}

export function createRecoveryRuntimePersistenceService(): RecoveryRuntimePersistenceService {
  return new RecoveryRuntimePersistenceService();
}
