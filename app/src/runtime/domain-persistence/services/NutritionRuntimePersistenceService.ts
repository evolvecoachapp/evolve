import type { NutritionRuntimePersistenceState } from "../models/NutritionRuntimePersistenceState";
import { createNutritionRuntimePersistenceState } from "../models/NutritionRuntimePersistenceState";

export interface NutritionRuntimePersistenceResult {
  readonly success: boolean;
  readonly state: NutritionRuntimePersistenceState | null;
  readonly message?: string;
}

export interface NutritionRuntimePersistenceBuildInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly state: NutritionRuntimePersistenceState;
}

/**
 * In-memory facade for persisted nutrition runtime overlays (Sprint 35.4).
 */
export class NutritionRuntimePersistenceService {
  private readonly latestByAthlete = new Map<string, NutritionRuntimePersistenceState>();

  build(input: NutritionRuntimePersistenceBuildInput): NutritionRuntimePersistenceResult {
    const state = createNutritionRuntimePersistenceState(input.state);
    this.latestByAthlete.set(input.athleteId, state);
    return Object.freeze({ success: true, state });
  }

  getState(athleteId: string): NutritionRuntimePersistenceState | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  restorePersisted(state: NutritionRuntimePersistenceState): void {
    this.latestByAthlete.set(state.athleteId, state);
  }
}

export function createNutritionRuntimePersistenceService(): NutritionRuntimePersistenceService {
  return new NutritionRuntimePersistenceService();
}
